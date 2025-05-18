import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

interface AddTaskDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  projectId: string;
}

// Task type definition
type Task = {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  createdAt: string;
  updatedAt: string;
};

// Function to create a new task
const createTask = async (task: { 
  projectId: string;
  title: string; 
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
}): Promise<Task> => {
  const res = await fetch(`/api/projects/${task.projectId}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: task.title,
      description: task.description,
      status: task.status
    }),
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error("Error creating task:", errorData);
    throw new Error(errorData.error || "Failed to create task");
  }
  
  const data = await res.json();
  return data.task;
};

export function AddTaskDialog({ isOpen, onOpenChange, projectId }: AddTaskDialogProps) {
  const queryClient = useQueryClient();
  
  // State for new task
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    status: "todo" as 'todo' | 'in-progress' | 'done',
  });

  // Mutation to create a new task
  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      // Invalidate and refetch tasks for this project
      queryClient.invalidateQueries({ queryKey: ['projectTasks', projectId] });
      // Reset form
      setNewTask({
        title: "",
        description: "",
        status: "todo",
      });
      onOpenChange(false);
    },
  });

  const handleCreateTask = () => {
    if (!newTask.title.trim()) return;
    
    createTaskMutation.mutate({
      projectId,
      title: newTask.title.trim(),
      description: newTask.description.trim() || undefined,
      status: newTask.status,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Task Title */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={newTask.title}
              onChange={(e) =>
                setNewTask({ ...newTask, title: e.target.value })
              }
              className="col-span-3 cursor-text"
              required
            />
          </div>
          
          {/* Task Description */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={newTask.description}
              onChange={(e) =>
                setNewTask({ ...newTask, description: e.target.value })
              }
              className="col-span-3 cursor-text"
              rows={3}
              placeholder="Optional"
            />
          </div>
          
          {/* Task Status */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select
              value={newTask.status}
              onValueChange={(value) =>
                setNewTask({ 
                  ...newTask, 
                  status: value as 'todo' | 'in-progress' | 'done' 
                })
              }
            >
              <SelectTrigger className="col-span-3 cursor-pointer">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo" className="cursor-pointer">To Do</SelectItem>
                <SelectItem value="in-progress" className="cursor-pointer">In Progress</SelectItem>
                <SelectItem value="done" className="cursor-pointer">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateTask} 
            className="cursor-pointer"
            disabled={!newTask.title || createTaskMutation.isPending}
          >
            {createTaskMutation.isPending ? "Adding..." : "Add Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 
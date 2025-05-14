import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";

// Define Task type based on the schema
type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: "todo" | "in_progress" | "done";
  dueDate?: string | null;
  projectId?: string | null;
  createdAt: string;
  updatedAt: string;
};

// Type for task creation form
type TaskFormData = {
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "done";
  dueDate: string | null;
  projectId: string | null;
};

export const Route = createFileRoute('/project-manager/tasks')({
  component: RouteComponent,
})

// Fetch tasks function
const fetchTasks = async (): Promise<Task[]> => {
  const response = await fetch('/api/tasks');
  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }
  return response.json();
};

// Create task function
const createTask = async (taskData: TaskFormData): Promise<Task> => {
  // Format the data to ensure it matches API expectations
  const formattedData = {
    ...taskData,
    // If description is empty string, send null instead
    description: taskData.description && taskData.description.trim() !== '' 
      ? taskData.description 
      : null,
    // Ensure dueDate is properly formatted as ISO datetime string or null
    dueDate: taskData.dueDate && taskData.dueDate.trim() !== '' 
      ? new Date(taskData.dueDate).toISOString() 
      : null,
  };

  console.log('Sending task data:', formattedData);
  
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formattedData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    console.error('Task creation error:', error);
    throw new Error(error.error || 'Failed to create task');
  }
  
  return response.json();
};

function RouteComponent() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: null,
    status: 'todo',
    dueDate: null,
    projectId: null,
  });
  
  // Query for fetching tasks
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
  });
  
  // Mutation for creating a task
  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      // Reset form
      setFormData({
        title: '',
        description: null,
        status: 'todo',
        dueDate: null,
        projectId: null,
      });
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: value === '' && name === 'description' ? null : value 
    }));
  };
  
  const handleStatusChange = (value: string) => {
    setFormData(prev => ({ ...prev, status: value as "todo" | "in_progress" | "done" }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTaskMutation.mutate(formData);
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Task Manager</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Task Creation Form */}
        <Card className="bg-neutral-950 border-neutral-800">
          <CardHeader>
            <CardTitle>Create New Task</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="cursor-text"
                  placeholder="Task title"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description"
                  name="description"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  className="cursor-text"
                  placeholder="Task description"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger id="status" className="cursor-pointer">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo" className="cursor-pointer">To Do</SelectItem>
                    <SelectItem value="in_progress" className="cursor-pointer">In Progress</SelectItem>
                    <SelectItem value="done" className="cursor-pointer">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date (Optional)</Label>
                <Input 
                  id="dueDate"
                  name="dueDate"
                  type="datetime-local"
                  value={formData.dueDate || ''}
                  onChange={handleInputChange}
                  className="cursor-text"
                />
              </div>
            </CardContent>
            
            <CardFooter>
              <Button 
                type="submit"
                className="cursor-pointer"
                disabled={createTaskMutation.isPending}
              >
                {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        {/* Tasks List */}
        <Card className="bg-neutral-950 border-neutral-800">
          <CardHeader>
            <CardTitle>Your Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="cursor-wait text-center py-4">Loading tasks...</div>
            ) : tasks.length === 0 ? (
              <div className="cursor-default text-center py-4 text-neutral-500">No tasks found. Create one!</div>
            ) : (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div key={task.id} className="p-3 border border-neutral-800 rounded-md cursor-pointer hover:bg-neutral-900">
                    <h3 className="font-medium">{task.title}</h3>
                    {task.description && <p className="text-sm text-neutral-400">{task.description}</p>}
                    <div className="flex justify-between mt-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        task.status === 'todo' 
                          ? 'bg-yellow-900/30 text-yellow-500' 
                          : task.status === 'in_progress' 
                          ? 'bg-blue-900/30 text-blue-500' 
                          : 'bg-green-900/30 text-green-500'
                      }`}>
                        {task.status === 'todo' 
                          ? 'To Do' 
                          : task.status === 'in_progress' 
                          ? 'In Progress' 
                          : 'Done'}
                      </span>
                      {task.dueDate && (
                        <span className="text-xs text-neutral-500">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

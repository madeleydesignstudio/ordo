import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { sql } from "drizzle-orm";
import { useState } from "react";
import { z } from "zod";
import { db } from "../../../db";
import { tasks } from "../../../schema";

// Task validation schema
const TaskSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  status: z.enum(["todo", "in_progress", "in_review", "done"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  dueDate: z.date().optional(),
});

export const Route = createFileRoute("/project-manager/$projectSlug")({
  component: ProjectPage,
  loader: async ({ params }) => {
    const project = await db.query.projects.findFirst({
      where: (projects, { like }) =>
        like(
          sql`lower(${projects.name})`,
          `${params.projectSlug.replace(/-/g, "%")}%`
        ),
      with: {
        tasks: true,
      },
    });
    if (!project) throw new Error("Project not found");
    return project;
  },
});

function ProjectPage() {
  const project = Route.useLoaderData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    dueDate: "",
  });
  const queryClient = useQueryClient();

  const createTaskMutation = useMutation({
    mutationFn: async (data: z.infer<typeof TaskSchema>) => {
      return await (db as any)
        .insert(tasks)
        .values({
          ...data,
          projectId: project.id,
        })
        .returning();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", project.id] });
      setFormData({
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        dueDate: "",
      });
      setIsDialogOpen(false);
    },
  });

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTaskMutation.mutateAsync({
        title: formData.title,
        description: formData.description,
        status: formData.status as "todo",
        priority: formData.priority as "medium",
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      });
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-200">
            {project.name}
          </h1>
          <p className="text-neutral-400">{project.description}</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>Add Task</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {["todo", "in_progress", "in_review", "done"].map((status) => (
          <div key={status} className="bg-neutral-800/50 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-neutral-200 mb-4 capitalize">
              {status.replace("_", " ")}
            </h2>
            <div className="space-y-4">
              {project.tasks
                .filter((task) => task.status === status)
                .map((task) => (
                  <div
                    key={task.id}
                    className="bg-neutral-800 p-4 rounded-lg border border-neutral-700"
                  >
                    <h3 className="font-medium text-neutral-200">
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-sm text-neutral-400 mt-2">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-3">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          task.priority === "urgent"
                            ? "bg-red-500/20 text-red-300"
                            : task.priority === "high"
                              ? "bg-orange-500/20 text-orange-300"
                              : task.priority === "medium"
                                ? "bg-yellow-500/20 text-yellow-300"
                                : "bg-blue-500/20 text-blue-300"
                        }`}
                      >
                        {task.priority}
                      </span>
                      {task.dueDate && (
                        <span className="text-xs text-neutral-400">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateTask}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Enter task title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Enter task description"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      dueDate: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create Task</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { sql } from "drizzle-orm";
import { db } from "../../../db";
import { createServerFn } from "@tanstack/start";
import { z } from "zod";
import { tasks } from "../../../schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

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

// Add task validation schema
const TaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(["todo", "in_progress", "in_review", "done"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  projectId: z.number(),
  dueDate: z.string().optional(),
});

// Add createTask server function
const createTask = createServerFn({ method: "POST" })
  .validator(TaskSchema)
  .handler(async ({ data }) => {
    const taskData = {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
    };
    return await db.insert(tasks).values(taskData).returning();
  });

// Add type for form data
type FormData = {
  title: string;
  description: string;
  status: "todo" | "in_progress" | "in_review" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  dueDate: string;
};

function ProjectPage() {
  const project = Route.useLoaderData();
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const utils = Route.useRouteContext();

  // Add form state
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    dueDate: "",
  });

  // Add form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTask({
        data: {
          title: formData.title,
          description: formData.description,
          status: formData.status,
          priority: formData.priority,
          projectId: project.id,
          dueDate: formData.dueDate,
        },
      });
      setIsNewTaskOpen(false);
      setFormData({
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        dueDate: "",
      });
      window.location.reload(); // Simple refresh instead of invalidate
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-neutral-200">{project.name}</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>New Task</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Priority</label>
                <Select
                  value={formData.priority}
                  onValueChange={(
                    value: "low" | "medium" | "high" | "urgent"
                  ) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={formData.status}
                  onValueChange={(
                    value: "todo" | "in_progress" | "in_review" | "done"
                  ) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">Todo</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="in_review">In Review</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Due Date</label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                />
              </div>
              <DialogFooter>
                <Button type="submit">Create Task</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
    </div>
  );
}

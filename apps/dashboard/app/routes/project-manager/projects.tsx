import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { db } from "../../../db";
import { projects } from "../../../schema";
import { createServerFn } from "@tanstack/start";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useRouter, Link } from "@tanstack/react-router";

// Define validation schemas
const ProjectSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  status: z.enum([
    "not_started",
    "in_progress",
    "on_hold",
    "completed",
    "cancelled",
  ]),
  dueDate: z.date().optional(),
});

// Server functions for projects
const getProjects = createServerFn({ method: "GET" }).handler(async () => {
  return await db.query.projects.findMany({
    with: {
      tasks: true,
    },
  });
});

const createProject = createServerFn({ method: "POST" })
  .validator(ProjectSchema)
  .handler(async ({ data }) => {
    return await db.insert(projects).values(data).returning();
  });

// Route definition
export const Route = createFileRoute("/project-manager/projects")({
  component: ProjectsComponent,
  loader: async () => {
    return await getProjects();
  },
});

function ProjectsComponent() {
  const router = useRouter();
  const projects = Route.useLoaderData();
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    dueDate: "",
  });
  const projectsPerPage = 6;

  // Calculate pagination
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = projects.slice(
    indexOfFirstProject,
    indexOfLastProject
  );
  const totalPages = Math.ceil(projects.length / projectsPerPage);
  const emptySlots = Math.max(0, projectsPerPage - currentProjects.length);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProject({
        data: {
          name: formData.name,
          description: formData.description,
          status: "not_started",
          dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
        },
      });

      // Reset form and close dialog
      setFormData({ name: "", description: "", dueDate: "" });
      setIsDialogOpen(false);

      // Refresh the route data
      await router.invalidate();
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  };

  return (
    <>
      <div className="h-full flex flex-col">
        <div className="flex-1 p-6 overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 h-full">
            {currentProjects.map((project) => (
              <Link
                key={project.id}
                to="/project-manager/$projectSlug"
                params={{
                  projectSlug: project.name
                    .toLowerCase()
                    .replace(/\s+/g, "-")
                    .replace(/[^a-z0-9-]/g, ""),
                }}
                className="bg-neutral-800 p-6 rounded-lg border border-neutral-700 flex flex-col justify-between h-full hover:bg-neutral-800/70 transition-colors"
              >
                <h3 className="text-lg font-semibold text-neutral-200">
                  {project.name}
                </h3>
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-neutral-400">
                    Status: {project.status}
                  </p>
                  <p className="text-sm text-neutral-400">
                    Due:{" "}
                    {project.dueDate
                      ? new Date(project.dueDate).toLocaleDateString()
                      : "No due date"}
                  </p>
                  <p className="text-sm text-neutral-400">
                    Tasks: {project.tasks?.length || 0}
                  </p>
                </div>
              </Link>
            ))}

            {/* Empty slots with create button */}
            {Array.from({ length: emptySlots }).map((_, index) => (
              <button
                key={`empty-${index}`}
                onClick={() => setIsDialogOpen(true)}
                className="bg-neutral-800/50 p-6 rounded-lg border border-dashed border-neutral-700 flex flex-col items-center justify-center h-full hover:bg-neutral-800/70 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-neutral-400 mb-2"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <span className="text-sm text-neutral-400">
                  Create New Project
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-900">
          <div className="flex justify-center items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded bg-neutral-700 text-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <span className="text-neutral-400">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded bg-neutral-700 text-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Create Project Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateProject}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Enter project name"
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
                  placeholder="Enter project description"
                />
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
              <Button type="submit">Create Project</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { sql } from "drizzle-orm";
import { db } from "../../../db";

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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-neutral-200 mb-6">
        {project.name}
      </h1>

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

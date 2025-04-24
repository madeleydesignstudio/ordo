import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  projectId: number;
  project?: {
    id: number;
    name: string;
  };
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export const Route = createFileRoute("/project-manager/tasks")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data, isLoading, isError, error } = useQuery<{ tasks: Task[] }>({
    queryKey: ["tasks"],
    queryFn: async () => {
      const response = await fetch("/api/tasks");
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      return response.json();
    },
  });

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (isError)
    return <div className="p-6 text-red-500">Error: {error?.message}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">All Tasks</h1>

      {data?.tasks.length === 0 ? (
        <div className="text-gray-500 italic">
          No tasks found. Create a task in a project to see it here.
        </div>
      ) : (
        <div className="grid gap-4">
          {data?.tasks.map((task) => (
            <div
              key={task.id}
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold">{task.title}</h2>
                  {task.description && (
                    <p className="text-gray-600 mt-1">{task.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      task.status === "todo"
                        ? "bg-gray-200 text-gray-700"
                        : task.status === "in_progress"
                          ? "bg-blue-200 text-blue-700"
                          : task.status === "in_review"
                            ? "bg-yellow-200 text-yellow-700"
                            : "bg-green-200 text-green-700"
                    }`}
                  >
                    {task.status.replace("_", " ")}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      task.priority === "low"
                        ? "bg-gray-200 text-gray-700"
                        : task.priority === "medium"
                          ? "bg-blue-200 text-blue-700"
                          : task.priority === "high"
                            ? "bg-orange-200 text-orange-700"
                            : "bg-red-200 text-red-700"
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex justify-between items-center text-sm text-gray-500">
                <div>
                  {task.project && (
                    <Link
                      to="/project-manager/$projectSlug"
                      params={{ projectSlug: task.project.id.toString() }}
                      className="text-blue-600 hover:underline"
                    >
                      Project: {task.project.name}
                    </Link>
                  )}
                </div>
                <div>
                  {task.dueDate && (
                    <span>
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

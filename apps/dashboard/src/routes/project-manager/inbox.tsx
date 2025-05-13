import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";

// Add this interface near the top of the file
interface Project {
  id: string;
  name: string;
  status: string;
  priority: string;
}

// Add this interface near the top of the file, next to the Project interface
interface Task {
  id: string;
  title: string;
  dueDate: string;
  status?: string;
}

// Remove mock data and add API client functions
const fetchProjects = async () => {
  const response = await fetch("/api/projects");
  if (!response.ok) {
    throw new Error("Failed to fetch projects");
  }
  const data = await response.json();
  return data.projects;
};

const fetchTasks = async () => {
  // Get today's date in ISO format for the API
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString();

  // Set end of day for inclusive filtering
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);
  const endOfDayStr = endOfDay.toISOString();

  const url = `/api/tasks?startDate=${todayStr}&endDate=${endOfDayStr}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch tasks");
  }
  return response.json();
};

export const Route = createFileRoute("/project-manager/inbox")({
  component: RouteComponent,
});

function RouteComponent() {
  // Replace useState with useQuery hooks
  const {
    data: projects = [],
    isLoading: isLoadingProjects,
    error: projectsError,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  const {
    data: tasks = [],
    isLoading: isLoadingTasks,
    error: tasksError,
  } = useQuery({
    queryKey: ["tasks", "today"],
    queryFn: fetchTasks,
  });

  // Derive active projects from the fetched data
  const activeProjects = projects
    .filter(
      (project: Project) =>
        project.status !== "completed" && project.status !== "archived",
    )
    .sort((a: Project, b: Project) => {
      const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
      return (
        (priorityOrder[a.priority as keyof typeof priorityOrder] || 3) -
        (priorityOrder[b.priority as keyof typeof priorityOrder] || 3)
      );
    })
    .slice(0, 3);

  // Today's tasks are already filtered by the API query

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-bold text-neutral-900">Inbox</h1>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-neutral-800">
          Top Active Projects
        </h2>
        {isLoadingProjects ? (
          <p className="text-neutral-500">Loading projects...</p>
        ) : projectsError ? (
          <p className="rounded-md bg-neutral-100 px-3 py-2 text-neutral-700">
            Error loading projects
          </p>
        ) : activeProjects.length > 0 ? (
          <div className="grid gap-4">
            {activeProjects.map((project: Project) => (
              <div
                key={project.id}
                className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm"
              >
                <h3 className="font-medium text-neutral-900">{project.name}</h3>
                <div className="mt-2">
                  <span
                    className={`inline-block rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-800`}
                  >
                    {project.priority || "normal"} priority
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-neutral-500">No active projects found.</p>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-neutral-800">Today's Tasks</h2>
        {isLoadingTasks ? (
          <p className="text-neutral-500">Loading tasks...</p>
        ) : tasksError ? (
          <p className="rounded-md bg-neutral-100 px-3 py-2 text-neutral-700">
            Error loading tasks
          </p>
        ) : tasks.length > 0 ? (
          <div className="grid gap-3">
            {tasks.map((task: Task) => (
              <div
                key={task.id}
                className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm"
              >
                <h3 className="font-medium text-neutral-900">{task.title}</h3>
                <p className="mt-1 text-sm text-neutral-500">
                  Due: {format(new Date(task.dueDate), "MMM d, yyyy")}
                </p>
                {task.status && (
                  <span className="mt-2 inline-block rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-700">
                    {task.status.replace("_", " ")}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-neutral-500">No tasks due today.</p>
        )}
      </section>
    </div>
  );
}

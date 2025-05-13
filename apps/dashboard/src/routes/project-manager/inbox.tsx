import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import ProjectLayout from "~/components/project-manager/project-layout";
import { ProjectData } from "~/components/project-manager/project-layout";

// Define interfaces that match our shared types but with additional fields needed for the inbox page
interface ProjectWithStatus {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  priority: string;
}

interface TaskWithDate {
  id: string;
  title: string;
  description?: string | null;
  status?: string;
  dueDate?: string | null;
  priority?: string;
  projectId?: string | null;
}

// Remove mock data and add API client functions
const fetchProjects = async () => {
  const response = await fetch("/api/projects");
  if (!response.ok) {
    throw new Error("Failed to fetch projects");
  }
  const data = await response.json();
  console.log("Projects API response:", data); // Debug log
  // Make sure we return an array, even if the API structure is different
  return Array.isArray(data.projects) ? data.projects : [];
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
  const data = await response.json();
  console.log("Tasks API response:", data); // Debug log
  // Make sure we return an array
  return Array.isArray(data) ? data : [];
};

export const Route = createFileRoute("/project-manager/inbox")({
  component: RouteComponent,
});

function RouteComponent() {
  // Replace useState with useQuery hooks
  const {
    data: projectsData = { projects: [] },
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

  // Ensure projects is always an array before filtering
  const projects = Array.isArray(projectsData) ? projectsData : [];

  // Derive active projects from the fetched data
  const activeProjects = projects
    .filter(
      (project: ProjectWithStatus) =>
        project.status !== "completed" && project.status !== "archived",
    )
    .sort((a: ProjectWithStatus, b: ProjectWithStatus) => {
      const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
      return (
        (priorityOrder[a.priority as keyof typeof priorityOrder] || 3) -
        (priorityOrder[b.priority as keyof typeof priorityOrder] || 3)
      );
    })
    .slice(0, 3);

  // Prepare data for our layout system
  const layoutData: ProjectData = {
    projects: projects,
    tasks: tasks
  };

  return (
    <div className="h-full overflow-auto">
      {(projectsError || tasksError) && (
        <div className="p-4 bg-red-900/20 border border-red-700 rounded-md m-4">
          <p className="text-red-400">Error: {String(projectsError || tasksError)}</p>
        </div>
      )}
      
      {isLoadingProjects || isLoadingTasks ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-neutral-400">Loading...</p>
        </div>
      ) : (
        <div className="space-y-8 p-6">
          <h1 className="text-2xl font-bold text-neutral-100">Inbox</h1>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-neutral-200">
              Top Active Projects
            </h2>
            {activeProjects.length > 0 ? (
              <div className="grid gap-4">
                {activeProjects.map((project: ProjectWithStatus) => (
                  <div
                    key={project.id}
                    className="rounded-lg border border-neutral-700 bg-neutral-800 p-4 shadow-sm"
                  >
                    <h3 className="font-medium text-neutral-100">{project.name}</h3>
                    <div className="mt-2">
                      <span
                        className={`inline-block rounded-full bg-neutral-700 px-2 py-1 text-xs text-neutral-300`}
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
            <h2 className="mb-4 text-xl font-semibold text-neutral-200">Today's Tasks</h2>
            {tasks.length > 0 ? (
              <div className="grid gap-3">
                {tasks.map((task: TaskWithDate) => (
                  <div
                    key={task.id}
                    className="rounded-lg border border-neutral-700 bg-neutral-800 p-4 shadow-sm"
                  >
                    <h3 className="font-medium text-neutral-100">{task.title}</h3>
                    {task.dueDate && (
                      <p className="mt-1 text-sm text-neutral-500">
                        Due: {format(new Date(task.dueDate), "MMM d, yyyy")}
                      </p>
                    )}
                    {task.status && (
                      <span className="mt-2 inline-block rounded-full bg-neutral-700 px-2 py-1 text-xs text-neutral-400">
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
          
          {/* We'll also add the layout component below the other content */}
          <section>
            <h2 className="mb-4 text-xl font-semibold text-neutral-200">Project Management</h2>
            <div className="border border-neutral-700 rounded-lg p-4 min-h-[400px]">
              <ProjectLayout data={layoutData} />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

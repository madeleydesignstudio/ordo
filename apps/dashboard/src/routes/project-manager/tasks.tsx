import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
// Import the enum values if they are exported from schema, otherwise define them here
import { taskStatusEnum } from "~/lib/server/schema/tasks.schema"; // Adjust path if needed

// Define a type for the task data based on your schema/API response
type Task = {
  id: string;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "done";
  dueDate: string | null; // Assuming API returns ISO string
  projectId: string | null;
  userId: string; // Add userId field to track task ownership
  createdAt: string; // Assuming API returns ISO string
  updatedAt: string; // Assuming API returns ISO string
};

// Define a type for the project data based on your API response
type Project = {
  id: string;
  name: string;
  // Add other project fields if needed
};

// Helper to format Date to YYYY-MM-DD for input type=date
const formatDateForInput = (date: Date | null): string => {
  if (!date) return "";
  return date.toISOString().split("T")[0];
};

export const Route = createFileRoute("/project-manager/tasks")({
  component: RouteComponent,
});

function RouteComponent() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [taskName, setTaskName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<"todo" | "in_progress" | "done">("todo");
  const [taskDueDate, setTaskDueDate] = useState("");

  // Fetch tasks function
  const fetchTasks = async () => {
    setIsLoadingTasks(true);
    setError(null); // Clear previous errors when fetching tasks
    try {
      // Modified to fetch only the current user's tasks
      const response = await fetch("/api/tasks/my-tasks");
      if (!response.ok) {
        throw new Error(`HTTP error fetching tasks! status: ${response.status}`);
      }
      const data: Task[] = await response.json();
      setTasks(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch tasks");
      console.error("Fetch tasks error:", e);
      setTasks([]); // Clear tasks on error
    } finally {
      setIsLoadingTasks(false);
    }
  };

  // Fetch projects function
  const fetchProjects = async () => {
    setIsLoadingProjects(true);
    setError(null);
    try {
      const response = await fetch("/api/projects"); // Assuming this is your projects endpoint
      if (!response.ok) {
        throw new Error(`HTTP error fetching projects! status: ${response.status}`);
      }
      // Adjust based on the actual structure returned by /api/projects
      const data: { projects: Project[] } = await response.json();
      setProjects(data.projects || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch projects");
      console.error("Fetch projects error:", e);
      setProjects([]); // Clear projects on error
    } finally {
      setIsLoadingProjects(false);
    }
  };

  // Fetch tasks and projects on component mount
  useEffect(() => {
    fetchTasks();
    fetchProjects();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Format dueDate: null if empty, otherwise add time for proper ISO string conversion if needed by backend
    const dueDateToSend = taskDueDate ? new Date(taskDueDate).toISOString() : null;

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: taskName,
          description: taskDescription,
          projectId: selectedProjectId,
          status: taskStatus,
          dueDate: dueDateToSend,
          // userId will be determined on the server from the authenticated session
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error creating task! status: ${response.status}`,
        );
      }

      // Clear form and refetch tasks
      setTaskName("");
      setTaskDescription("");
      setSelectedProjectId(null);
      setTaskStatus("todo");
      setTaskDueDate("");
      fetchTasks(); // Refetch tasks to show the newly created one
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create task");
      console.error("Create task error:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-neutral-100">Tasks</h1>

      {/* Create Task Form */}
      <div className="mb-8 rounded-lg border border-neutral-700 bg-neutral-800 p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-neutral-200">Create New Task</h2>

        {error && <p className="mb-4 text-sm text-red-400">Error: {error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="taskName"
              className="mb-1 block text-sm font-medium text-neutral-300"
            >
              Task Name
            </label>
            <input
              id="taskName"
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              required
              disabled={isSubmitting}
              className="w-full rounded-md border border-neutral-600 bg-neutral-700 px-3 py-2 text-neutral-100 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="taskDescription"
              className="mb-1 block text-sm font-medium text-neutral-300"
            >
              Description
            </label>
            <textarea
              id="taskDescription"
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-md border border-neutral-600 bg-neutral-700 px-3 py-2 text-neutral-100 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
              rows={3}
            />
          </div>

          <div>
            <label
              htmlFor="taskStatus"
              className="mb-1 block text-sm font-medium text-neutral-300"
            >
              Status
            </label>
            <select
              id="taskStatus"
              value={taskStatus}
              onChange={(e) => setTaskStatus(e.target.value as typeof taskStatus)}
              disabled={isSubmitting}
              className="w-full rounded-md border border-neutral-600 bg-neutral-700 px-3 py-2 text-neutral-100 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {(taskStatusEnum?.enumValues || ["todo", "in_progress", "done"]).map(
                (statusValue) => (
                  <option key={statusValue} value={statusValue}>
                    {statusValue.replace("_", " ")}
                  </option>
                ),
              )}
            </select>
          </div>

          <div>
            <label
              htmlFor="taskDueDate"
              className="mb-1 block text-sm font-medium text-neutral-300"
            >
              Due Date
            </label>
            <input
              id="taskDueDate"
              type="date"
              value={taskDueDate}
              onChange={(e) => setTaskDueDate(e.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-md border border-neutral-600 bg-neutral-700 px-3 py-2 text-neutral-100 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="projectSelect"
              className="mb-1 block text-sm font-medium text-neutral-300"
            >
              Assign to Project
            </label>
            <select
              id="projectSelect"
              value={selectedProjectId ?? ""}
              onChange={(e) => setSelectedProjectId(e.target.value || null)}
              disabled={isLoadingProjects || isSubmitting}
              className="w-full rounded-md border border-neutral-600 bg-neutral-700 px-3 py-2 text-neutral-100 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">-- No Project --</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            {isLoadingProjects && (
              <span className="text-xs text-neutral-500"> Loading projects...</span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Create Task"}
          </button>
        </form>
      </div>

      {/* Task List */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-neutral-200">Task List</h2>

        {isLoadingTasks && <p className="text-neutral-400">Loading tasks...</p>}
        {!isLoadingTasks && !error && tasks.length === 0 && (
          <p className="text-neutral-400 italic">No tasks found. Create one above!</p>
        )}

        {!isLoadingTasks && !error && tasks.length > 0 && (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="rounded-lg border border-neutral-700 bg-neutral-800 p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-medium text-neutral-200">{task.title}</h3>
                  <span className="rounded-full bg-neutral-700 px-2 py-1 text-xs text-neutral-300">
                    {task.status.replace("_", " ")}
                  </span>
                </div>

                {task.description && (
                  <p className="mt-2 text-neutral-400">{task.description}</p>
                )}

                <div className="mt-3 flex flex-wrap gap-2 text-xs text-neutral-500">
                  {task.projectId && (
                    <span className="flex items-center">
                      Project:{" "}
                      {projects.find((p) => p.id === task.projectId)?.name ?? "..."}
                    </span>
                  )}

                  {task.dueDate && (
                    <span className="flex items-center">
                      Due: {formatDateForInput(new Date(task.dueDate))}
                    </span>
                  )}

                  <span className="flex items-center">
                    Created: {new Date(task.createdAt).toLocaleString()}
                  </span>
                </div>

                {/* TODO: Add edit/delete buttons here */}
                <div className="mt-4 flex space-x-2">
                  <button className="rounded-md bg-neutral-700 px-3 py-1.5 text-neutral-200 transition-colors hover:bg-neutral-600 focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 focus:outline-none">
                    Edit
                  </button>
                  <button className="rounded-md border border-red-700 bg-neutral-800 px-3 py-1.5 text-red-400 transition-colors hover:bg-red-900 hover:text-red-300 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

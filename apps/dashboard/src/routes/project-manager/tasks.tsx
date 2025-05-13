import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import ProjectLayout from "~/components/project-manager/project-layout";
import { Project, Task, ProjectData } from "~/components/project-manager/project-layout";

export const Route = createFileRoute("/project-manager/tasks")({
  component: RouteComponent,
});

function RouteComponent() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/tasks/my-tasks");
      if (!response.ok) {
        throw new Error(`HTTP error fetching tasks! status: ${response.status}`);
      }
      const data: Task[] = await response.json();
      setTasks(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch tasks");
      console.error("Fetch tasks error:", e);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch projects function
  const fetchProjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/projects");
      if (!response.ok) {
        throw new Error(`HTTP error fetching projects! status: ${response.status}`);
      }
      const data = await response.json();
      
      // More defensive checks on the data structure
      if (!data || typeof data !== 'object') {
        console.error("Invalid projects data format:", data);
        setProjects([]);
        return;
      }
      
      // Ensure we have an array of projects, even if the API returns an unexpected format
      const projectsList = Array.isArray(data.projects) ? data.projects : [];
      console.log("Projects fetched:", projectsList);
      
      setProjects(projectsList);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch projects");
      console.error("Fetch projects error:", e);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    
    // Validate that project is selected
    if (!selectedProjectId) {
      setError("Project selection is required");
      return;
    }
    
    setIsSubmitting(true);

    // Format dueDate: null if empty, otherwise add time for proper ISO string conversion if needed
    const dueDateToSend = taskDueDate ? new Date(taskDueDate).toISOString() : null;

    try {
      const projectId = selectedProjectId || "1"; // Default to first project if none selected
      
      // Find the selected project to get its name
      const selectedProject = projects.find(p => p.id === projectId);
      const projectName = selectedProject?.name || "";
      
      // Debug the request data
      const requestData = {
        title: taskName,
        description: taskDescription,
        status: taskStatus,
        dueDate: dueDateToSend,
        projectName: projectName,
      };
      console.log("Submitting task with data:", requestData);

      const response = await fetch(`/api/projects/${projectId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      // Log the response status
      console.log("Task creation response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Task creation error response:", errorData);
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

  // Fetch tasks and projects on component mount
  useEffect(() => {
    fetchTasks();
    fetchProjects();
  }, []);

  // Use our new layout with the projects and tasks data
  const layoutData: ProjectData = {
    projects,
    tasks
  };

  return (
    <div className="h-full overflow-auto">
      {error && (
        <div className="p-4 bg-red-900/20 border border-red-700 rounded-md m-4">
          <p className="text-red-400">Error: {error}</p>
        </div>
      )}
      
      <div className="p-6 space-y-6">
        {/* Task Creation Form */}
        <div className="mb-6 rounded-lg border border-neutral-700 bg-neutral-800 p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold text-neutral-200">Create New Task</h2>
          
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
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
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
                Assign to Project <span className="text-red-400">*</span>
              </label>
              <select
                id="projectSelect"
                value={selectedProjectId ?? ""}
                onChange={(e) => setSelectedProjectId(e.target.value || null)}
                disabled={isLoading || isSubmitting}
                className="w-full rounded-md border border-neutral-600 bg-neutral-700 px-3 py-2 text-neutral-100 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              >
                <option value="">-- Select a Project --</option>
                {projects.length > 0 ? (
                  projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No projects available</option>
                )}
              </select>
              {!selectedProjectId && (
                <p className="text-xs text-red-400 mt-1">Please select a project for the task</p>
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

        {/* Task List with our Layout Views */}
        <div className="rounded-lg border border-neutral-700 bg-neutral-800/50 p-4">
          <h2 className="mb-4 text-xl font-semibold text-neutral-200">Task Management</h2>
          
          {isLoading ? (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-neutral-400">Loading...</p>
            </div>
          ) : (
            <div className="min-h-[300px]">
              <ProjectLayout data={layoutData} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

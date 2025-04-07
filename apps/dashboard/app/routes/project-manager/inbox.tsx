import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

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

type Project = {
  id: string;
  name: string;
};

export const Route = createFileRoute("/project-manager/inbox")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    projectId: "",
    priority: "medium",
    dueDate: new Date().toISOString().split("T")[0], // Today's date as default
  });
  const queryClient = useQueryClient();

  // Fetch all tasks
  const { data: tasksData, isLoading: tasksLoading } = useQuery<{
    tasks: Task[];
  }>({
    queryKey: ["tasks"],
    queryFn: async () => {
      const response = await fetch("/api/tasks");
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      return response.json();
    },
  });

  // Fetch all projects for the dropdown
  const { data: projectsData, isLoading: projectsLoading } = useQuery<{
    projects: Project[];
  }>({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await fetch("/api/projects");
      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }
      return response.json();
    },
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: {
      title: string;
      description: string;
      projectId: string;
      priority: string;
      dueDate: string;
    }) => {
      const projectId = taskData.projectId || "1"; // Default to first project if none selected

      const response = await fetch(`/api/projects/${projectId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority,
          dueDate: taskData.dueDate,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create task");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setIsModalOpen(false);
      setNewTask({
        title: "",
        description: "",
        projectId: "",
        priority: "medium",
        dueDate: new Date().toISOString().split("T")[0],
      });
    },
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    createTaskMutation.mutate(newTask);
  };

  const handleTaskClick = (taskId: string) => {
    navigate({ to: "/project-manager/$taskId", params: { taskId } });
  };

  // Filter tasks for today
  const today = new Date().toISOString().split("T")[0];
  const todaysTasks =
    tasksData?.tasks.filter((task) => {
      if (!task.dueDate) return false;
      return task.dueDate.split("T")[0] === today;
    }) || [];

  // Filter tasks without a due date (inbox tasks)
  const inboxTasks = tasksData?.tasks.filter((task) => !task.dueDate) || [];

  if (tasksLoading || projectsLoading)
    return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inbox</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Create Task
        </button>
      </div>

      {/* Today's Tasks Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Today's Tasks</h2>
        {todaysTasks.length === 0 ? (
          <div className="text-gray-500 italic p-4 border rounded-lg">
            No tasks due today.
          </div>
        ) : (
          <div className="grid gap-4">
            {todaysTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => handleTaskClick(task.id)}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold group-hover:text-blue-600 transition-colors">
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-gray-600 mt-1">{task.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
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
                        onClick={(e) => e.stopPropagation()}
                      >
                        Project: {task.project.name}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Inbox Tasks Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Inbox Tasks</h2>
        {inboxTasks.length === 0 ? (
          <div className="text-gray-500 italic p-4 border rounded-lg">
            No inbox tasks. Create a task without a due date to see it here.
          </div>
        ) : (
          <div className="grid gap-4">
            {inboxTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => handleTaskClick(task.id)}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold group-hover:text-blue-600 transition-colors">
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-gray-600 mt-1">{task.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
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
                        onClick={(e) => e.stopPropagation()}
                      >
                        Project: {task.project.name}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Task</h2>
            <form onSubmit={handleCreateTask}>
              <div className="mb-4">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Task Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="project"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Project (Optional)
                </label>
                <select
                  id="project"
                  value={newTask.projectId}
                  onChange={(e) =>
                    setNewTask({ ...newTask, projectId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No Project</option>
                  {projectsData?.projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="priority"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Priority
                </label>
                <select
                  id="priority"
                  value={newTask.priority}
                  onChange={(e) =>
                    setNewTask({ ...newTask, priority: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="dueDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Due Date (Optional)
                </label>
                <input
                  type="date"
                  id="dueDate"
                  value={newTask.dueDate}
                  onChange={(e) =>
                    setNewTask({ ...newTask, dueDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  disabled={createTaskMutation.isPending}
                >
                  {createTaskMutation.isPending ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

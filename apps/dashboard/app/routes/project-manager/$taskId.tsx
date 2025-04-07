import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  projectId: string;
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

export const Route = createFileRoute("/project-manager/$taskId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { taskId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Task | null>(null);

  // Fetch task details
  const { data: task, isLoading: taskLoading } = useQuery<Task>({
    queryKey: ["task", taskId],
    queryFn: async () => {
      const response = await fetch(`/api/tasks/${taskId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch task");
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

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async (updatedTask: Task) => {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTask),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update task");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setIsEditing(false);
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete task");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      navigate({ to: "/project-manager/inbox" });
    },
  });

  useEffect(() => {
    if (task) {
      setEditedTask(task as Task);
    }
  }, [task]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (task) {
      setEditedTask(task);
    }
    setIsEditing(false);
  };

  const handleSave = () => {
    if (editedTask) {
      updateTaskMutation.mutate(editedTask);
    }
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      deleteTaskMutation.mutate();
    }
  };

  const handleChange = (field: keyof Task, value: string | null) => {
    if (editedTask) {
      setEditedTask({ ...editedTask, [field]: value });
    }
  };

  if (taskLoading || projectsLoading)
    return <div className="p-6">Loading...</div>;
  if (!task) return <div className="p-6">Task not found</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Task Details</h1>
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                disabled={updateTaskMutation.isPending}
              >
                {updateTaskMutation.isPending ? "Saving..." : "Save"}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          {isEditing ? (
            <input
              type="text"
              value={editedTask?.title || ""}
              onChange={(e) => handleChange("title", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-lg">{task.title}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          {isEditing ? (
            <textarea
              value={editedTask?.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
          ) : (
            <p className="text-gray-600">
              {task.description || "No description"}
            </p>
          )}
        </div>

        {/* Project */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project
          </label>
          {isEditing ? (
            <select
              value={editedTask?.projectId || ""}
              onChange={(e) => handleChange("projectId", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">No Project</option>
              {projectsData?.projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-gray-600">
              {task.project?.name || "No project assigned"}
            </p>
          )}
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          {isEditing ? (
            <select
              value={editedTask?.priority || "medium"}
              onChange={(e) => handleChange("priority", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          ) : (
            <span
              className={`px-2 py-1 rounded-full text-sm ${
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
          )}
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Due Date
          </label>
          {isEditing ? (
            <input
              type="date"
              value={editedTask?.dueDate?.split("T")[0] || ""}
              onChange={(e) => handleChange("dueDate", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-gray-600">
              {task.dueDate
                ? new Date(task.dueDate).toLocaleDateString()
                : "No due date"}
            </p>
          )}
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          {isEditing ? (
            <select
              value={editedTask?.status || "pending"}
              onChange={(e) => handleChange("status", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          ) : (
            <span
              className={`px-2 py-1 rounded-full text-sm ${
                task.status === "completed"
                  ? "bg-green-200 text-green-700"
                  : task.status === "in_progress"
                    ? "bg-yellow-200 text-yellow-700"
                    : "bg-gray-200 text-gray-700"
              }`}
            >
              {task.status.replace("_", " ")}
            </span>
          )}
        </div>

        {/* Metadata */}
        <div className="pt-4 border-t">
          <p className="text-sm text-gray-500">
            Created: {new Date(task.createdAt).toLocaleString()}
          </p>
          <p className="text-sm text-gray-500">
            Last updated: {new Date(task.updatedAt).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

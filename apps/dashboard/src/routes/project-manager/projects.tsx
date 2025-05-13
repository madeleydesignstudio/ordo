import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import React, { useState } from "react";

// Define the type for a project based on schema/API response
// Adjust based on the actual structure returned by your API
type Project = {
  id: string; // Assuming UUID string from schema
  name: string;
  description?: string | null;
  createdAt: string; // Assuming ISO string from DB
  updatedAt: string; // Assuming ISO string from DB
  // tasks?: any[]; // Include if tasks are fetched and needed
};

// Function to fetch projects
const fetchProjects = async (): Promise<{ projects: Project[] }> => {
  const res = await fetch("/api/projects?currentUserOnly=true");
  if (!res.ok) {
    throw new Error("Network response was not ok");
  }
  return res.json();
};

// Function to create a project
const createProject = async (newProject: {
  name: string;
  description?: string;
}): Promise<{ project: Project }> => {
  const res = await fetch("/api/projects", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newProject),
  });
  if (!res.ok) {
    // Attempt to read error message from API response
    const errorData = await res
      .json()
      .catch(() => ({ error: "Failed to create project. Check server logs." }));
    throw new Error(errorData?.error || "Failed to create project");
  }
  return res.json();
};

const updateProject = async (updatedData: {
  id: string;
  name?: string;
  description?: string | null;
}): Promise<{ project: Project }> => {
  const res = await fetch("/api/projects", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedData),
  });
  if (!res.ok) {
    const errorData = await res
      .json()
      .catch(() => ({ error: "Failed to update project. Check server logs." }));
    throw new Error(errorData?.error || "Failed to update project");
  }
  return res.json();
};

const deleteProject = async (
  projectId: string,
): Promise<{ message: string; deletedProjectId: string }> => {
  const res = await fetch("/api/projects", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: projectId }), // Send ID in body as per API handler
  });
  if (!res.ok) {
    const errorData = await res
      .json()
      .catch(() => ({ error: "Failed to delete project. Check server logs." }));
    throw new Error(errorData?.error || "Failed to delete project");
  }
  return res.json();
};

export const Route = createFileRoute("/project-manager/projects")({
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // State for inline editing
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Query for fetching projects
  const {
    data: projectsData,
    isLoading,
    error: projectsError,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  // Common invalidation logic
  const invalidateProjects = () => {
    queryClient.invalidateQueries({ queryKey: ["projects"] });
  };

  // Mutation for creating projects
  const createProjectMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      invalidateProjects();
      setProjectName("");
      setProjectDescription("");
      setFormError(null);
    },
    onError: (error) => {
      setFormError(`Create Error: ${error.message}`);
    },
  });

  // Mutation for updating projects
  const updateProjectMutation = useMutation({
    mutationFn: updateProject,
    onSuccess: () => {
      invalidateProjects();
      setEditingProjectId(null); // Exit editing mode
    },
    onError: (error) => {
      // Display error specific to the item being edited?
      // For now, setting general form error
      setFormError(`Update Error: ${error.message}`);
    },
  });

  // Mutation for deleting projects
  const deleteProjectMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      invalidateProjects();
    },
    onError: (error) => {
      setFormError(`Delete Error: ${error.message}`);
    },
  });

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!projectName.trim()) {
      setFormError("Project name is required.");
      return;
    }
    createProjectMutation.mutate({ name: projectName, description: projectDescription });
  };

  const handleEditClick = (project: Project) => {
    setEditingProjectId(project.id);
    setEditName(project.name);
    setEditDescription(project.description || "");
    setFormError(null); // Clear errors when starting edit
  };

  const handleCancelEdit = () => {
    setEditingProjectId(null);
  };

  const handleSaveEdit = (projectId: string) => {
    if (!editName.trim()) {
      setFormError("Project name cannot be empty.");
      return;
    }
    updateProjectMutation.mutate({
      id: projectId,
      name: editName,
      description: editDescription,
    });
  };

  const handleDeleteClick = (projectId: string, projectName: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete the project "${projectName}"? This cannot be undone.`,
      )
    ) {
      deleteProjectMutation.mutate(projectId);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-neutral-100">Projects</h1>

      {/* Create Project Form */}
      <div className="mb-8 rounded-lg border border-neutral-700 bg-neutral-800 p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-neutral-200">
          Create New Project
        </h2>

        {/* Display create/general errors here */}
        {formError && !editingProjectId && (
          <p className="mb-4 text-sm text-red-400">Error: {formError}</p>
        )}
        {createProjectMutation.isError && !editingProjectId && (
          <p className="mb-4 text-sm text-red-400">
            Create Error: {createProjectMutation.error.message}
          </p>
        )}

        <form onSubmit={handleCreateProject} className="space-y-4">
          <div>
            <label
              htmlFor="projectName"
              className="mb-1 block text-sm font-medium text-neutral-300"
            >
              Name
            </label>
            <input
              id="projectName"
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
              className="w-full rounded-md border border-neutral-600 bg-neutral-700 px-3 py-2 text-neutral-100 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
              disabled={createProjectMutation.isPending}
            />
          </div>

          <div>
            <label
              htmlFor="projectDescription"
              className="mb-1 block text-sm font-medium text-neutral-300"
            >
              Description
            </label>
            <textarea
              id="projectDescription"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              className="w-full rounded-md border border-neutral-600 bg-neutral-700 px-3 py-2 text-neutral-100 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
              rows={3}
              disabled={createProjectMutation.isPending}
            />
          </div>

          <button
            type="submit"
            disabled={createProjectMutation.isPending}
            className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {createProjectMutation.isPending ? "Creating..." : "Create Project"}
          </button>
        </form>
      </div>

      {/* Project List */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-neutral-200">Project List</h2>

        {/* Display delete/update errors here */}
        {formError && editingProjectId && (
          <p className="mb-4 text-sm text-red-400">Error: {formError}</p>
        )}
        {deleteProjectMutation.isError && (
          <p className="mb-4 text-sm text-red-400">
            Delete Error: {deleteProjectMutation.error.message}
          </p>
        )}

        {isLoading && <p className="text-neutral-400">Loading projects...</p>}
        {projectsError && (
          <p className="text-red-400">Error loading projects: {projectsError.message}</p>
        )}

        {projectsData && projectsData.projects.length > 0 ? (
          <div className="space-y-4">
            {projectsData.projects.map((project) => (
              <div
                key={project.id}
                className={`rounded-lg border shadow-sm ${
                  editingProjectId === project.id
                    ? "border-blue-500 bg-neutral-800"
                    : "border-neutral-700 bg-neutral-800"
                } p-5 transition-all`}
              >
                {editingProjectId === project.id ? (
                  // -- Editing View --
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor={`editName-${project.id}`}
                        className="mb-1 block text-sm font-medium text-neutral-300"
                      >
                        Name
                      </label>
                      <input
                        id={`editName-${project.id}`}
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        required
                        className="w-full rounded-md border border-neutral-600 bg-neutral-700 px-3 py-2 text-neutral-100 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        disabled={updateProjectMutation.isPending}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`editDesc-${project.id}`}
                        className="mb-1 block text-sm font-medium text-neutral-300"
                      >
                        Description
                      </label>
                      <textarea
                        id={`editDesc-${project.id}`}
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="w-full rounded-md border border-neutral-600 bg-neutral-700 px-3 py-2 text-neutral-100 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        rows={3}
                        disabled={updateProjectMutation.isPending}
                      />
                    </div>

                    {/* Show specific update error for this item */}
                    {updateProjectMutation.isError && editingProjectId === project.id && (
                      <p className="text-sm text-red-400">
                        Update Error: {updateProjectMutation.error.message}
                      </p>
                    )}

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSaveEdit(project.id)}
                        disabled={updateProjectMutation.isPending || !editName.trim()}
                        className="rounded-md bg-blue-600 px-3 py-1.5 text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {updateProjectMutation.isPending ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={updateProjectMutation.isPending}
                        className="rounded-md bg-neutral-600 px-3 py-1.5 text-neutral-200 transition-colors hover:bg-neutral-700 focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // -- Display View --
                  <div>
                    <h3 className="mb-2 text-lg font-medium text-neutral-200">
                      {project.name}
                    </h3>
                    <p className="mb-3 text-neutral-400">
                      {project.description || "No description"}
                    </p>
                    <p className="mb-4 text-xs text-neutral-500">
                      Created: {new Date(project.createdAt).toLocaleString()}
                    </p>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditClick(project)}
                        disabled={
                          deleteProjectMutation.isPending ||
                          updateProjectMutation.isPending ||
                          editingProjectId !== null
                        }
                        className="rounded-md bg-neutral-700 px-3 py-1.5 text-neutral-200 transition-colors hover:bg-neutral-600 focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(project.id, project.name)}
                        disabled={
                          deleteProjectMutation.isPending ||
                          updateProjectMutation.isPending ||
                          editingProjectId !== null
                        }
                        className="rounded-md border border-red-700 bg-neutral-800 px-3 py-1.5 text-red-400 transition-colors hover:bg-red-900 hover:text-red-300 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deleteProjectMutation.isPending &&
                        deleteProjectMutation.variables === project.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          !isLoading &&
          !projectsError && (
            <p className="text-neutral-400 italic">
              No projects found. Create one above!
            </p>
          )
        )}
      </div>
    </div>
  );
}

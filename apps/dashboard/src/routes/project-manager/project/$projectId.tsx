import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useParams, Outlet, useRouterState } from '@tanstack/react-router';
import { Settings, Plus, ListPlus } from "lucide-react";
import { useState } from "react";
import { AddTaskDialog } from "~/components/providers/add-task";

// Define the type for a project
type Project = {
  id: string;
  name: string;
  description?: string | null;
  icon?: string;
  bannerImage?: string | null;
  createdAt: string;
  updatedAt: string;
};

// Define the type for a task
type Task = {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  createdAt: string;
  updatedAt: string;
};

// Function to fetch a single project
const fetchProject = async (projectId: string): Promise<Project> => {
  console.log(`Fetching project details for ID: ${projectId}`);
  const res = await fetch(`/api/projects/${projectId}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error("Error fetching project:", errorData);
    throw new Error(errorData.error || "Failed to fetch project");
  }
  const data = await res.json();
  console.log("Received project data:", data);
  return data.project;
};

// Function to fetch tasks for a project
const fetchTasks = async (projectId: string): Promise<Task[]> => {
  console.log(`Fetching tasks for project ID: ${projectId}`);
  const res = await fetch(`/api/projects/${projectId}/tasks`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error("Error fetching tasks:", errorData);
    throw new Error(errorData.error || "Failed to fetch tasks");
  }
  const data = await res.json();
  console.log("Received tasks data:", data);
  return data.tasks || [];
};

export const Route = createFileRoute('/project-manager/project/$projectId')({
  component: ProjectDetailsComponent,
})

function ProjectDetailsComponent() {
  // Get the project ID from the URL
  const { projectId } = useParams({ from: '/project-manager/project/$projectId' });
  
  // Use router state to properly detect nested routes
  const routerState = useRouterState();
  const isSettingsRoute = routerState.location.pathname.includes(`/project-manager/project/${projectId}/settings`);
  
  // State for Add Task dialog
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  
  // Always fetch project data, but only use it if we're not on the settings route
  const {
    data: project,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => fetchProject(projectId),
    enabled: !!projectId,
  });
  
  // If we're on a nested route, render it through the outlet instead
  if (isSettingsRoute) {
    return <Outlet />;
  }
  
  // Otherwise, show the project details
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-neutral-400">Loading project...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-900/20 border border-red-700 rounded-md m-4">
        <p className="text-red-400">Error: {String(error)}</p>
      </div>
    );
  }
  
  if (!project) {
    return (
      <div className="p-4 bg-yellow-900/20 border border-yellow-700 rounded-md m-4">
        <p className="text-yellow-400">Project not found</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Project Header with Banner */}
      <div className="relative h-48 rounded-t-lg overflow-hidden mb-6">
        {project.bannerImage ? (
          <img 
            src={project.bannerImage} 
            alt={`${project.name} banner`} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-600 to-purple-600"></div>
        )}
        
        {/* Header Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
          <div className="flex justify-between items-end">
            <div className="flex items-center">
              <span className="text-3xl mr-3">{project.icon || "📁"}</span>
              <h1 className="text-2xl font-bold text-white">{project.name}</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddTaskDialogOpen(true)}
                className="p-2 rounded-full bg-neutral-800/80 hover:bg-neutral-700/80 cursor-pointer"
              >
                <ListPlus className="h-5 w-5 text-neutral-200" />
                <span className="sr-only">Add Task</span>
              </button>
              <Link
                to="/project-manager/project/$projectId/settings"
                params={{ projectId }}
                className="p-2 rounded-full bg-neutral-800/80 hover:bg-neutral-700/80 cursor-pointer"
              >
                <Settings className="h-5 w-5 text-neutral-200" />
                <span className="sr-only">Project Settings</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Project Description */}
      <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-neutral-200 mb-2">About this project</h2>
        <p className="text-neutral-400">
          {project.description || "No description provided."}
        </p>
        <div className="mt-4 flex space-x-4 text-xs text-neutral-500">
          <p>Created: {new Date(project.createdAt).toLocaleDateString()}</p>
          <p>Last updated: {new Date(project.updatedAt).toLocaleDateString()}</p>
        </div>
      </div>
      
      {/* Project Tasks Section */}
      <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-neutral-200">Tasks</h2>
          <button
            onClick={() => setIsAddTaskDialogOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-neutral-700/30 hover:bg-neutral-700/50 text-neutral-300 rounded-md cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Task</span>
          </button>
        </div>
        <TasksSection projectId={projectId} />
      </div>
      
      {/* Project Content Placeholder - can be expanded later */}
      <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-neutral-200 mb-4">Project Content</h2>
        <p className="text-neutral-400">
          Additional project dashboard content will be displayed here.
        </p>
      </div>
      
      {/* Add Task Dialog */}
      <AddTaskDialog 
        isOpen={isAddTaskDialogOpen}
        onOpenChange={setIsAddTaskDialogOpen}
        projectId={projectId}
      />
    </div>
  );
}

// Tasks Section Component
function TasksSection({ projectId }: { projectId: string }) {
  // Query to fetch tasks
  const { 
    data: tasks = [], 
    isLoading: tasksLoading,
    error: tasksError
  } = useQuery({
    queryKey: ['projectTasks', projectId],
    queryFn: () => fetchTasks(projectId),
    enabled: !!projectId,
  });
  
  if (tasksLoading) {
    return <p className="text-neutral-400">Loading tasks...</p>;
  }
  
  if (tasksError) {
    return <p className="text-red-400">Error loading tasks</p>;
  }
  
  return (
    <div>
      {/* Task List */}
      {tasks.length > 0 ? (
        <ul className="space-y-4">
          {tasks.map((task) => (
            <li key={task.id} className="p-4 bg-neutral-700/20 border border-neutral-700 rounded-md">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-neutral-200">{task.title}</h3>
                  {task.description && (
                    <p className="mt-1 text-sm text-neutral-400">{task.description}</p>
                  )}
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  task.status === 'todo' 
                    ? 'bg-blue-900/30 text-blue-400 border border-blue-700/50' 
                    : task.status === 'in-progress' 
                    ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-700/50'
                    : 'bg-green-900/30 text-green-400 border border-green-700/50'
                }`}>
                  {task.status === 'todo' 
                    ? 'To Do' 
                    : task.status === 'in-progress' 
                    ? 'In Progress' 
                    : 'Done'}
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-neutral-500 italic">No tasks yet. Add one to get started.</p>
      )}
    </div>
  );
}

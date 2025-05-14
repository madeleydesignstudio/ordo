import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { 
  Settings, 
  ChevronLeft, 
  Save, 
  Trash, 
  Image, 
  Smile, 
  X 
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";

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

// Function to fetch a single project
const fetchProject = async (projectId: string): Promise<Project> => {
  console.log(`Fetching project settings for ID: ${projectId}`);
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

// Function to update a project
const updateProject = async (updatedData: {
  id: string;
  name?: string;
  description?: string | null;
  icon?: string;
  bannerImage?: string | null;
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

// Function to delete a project
const deleteProject = async (
  projectId: string,
): Promise<{ message: string; deletedProjectId: string }> => {
  const res = await fetch("/api/projects", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: projectId }),
  });
  
  if (!res.ok) {
    const errorData = await res
      .json()
      .catch(() => ({ error: "Failed to delete project. Check server logs." }));
    throw new Error(errorData?.error || "Failed to delete project");
  }
  
  return res.json();
};

export const Route = createFileRoute('/project-manager/project/$projectId/settings')({
  component: ProjectSettingsComponent,
})

function ProjectSettingsComponent() {
  // Get project ID directly from URL params
  const { projectId } = useParams({ from: '/project-manager/project/$projectId/settings' });
  
  console.log("Settings component rendering with projectId:", projectId);
  
  const queryClient = useQueryClient();
  
  // Local state for form fields
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    icon: string;
    bannerImage: string | null;
  }>({
    name: "",
    description: "",
    icon: "📁",
    bannerImage: null,
  });
  
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  
  // Fetch project data
  const {
    data: project,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => fetchProject(projectId),
    enabled: !!projectId,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
  
  // Update local state when project data is loaded
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || "",
        description: project.description || "",
        icon: project.icon || "📁",
        bannerImage: project.bannerImage || null,
      });
      
      if (project.bannerImage) {
        setBannerPreview(project.bannerImage);
      }
    }
  }, [project]);
  
  // Handle file dropping for banner image
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
    onDrop: acceptedFiles => {
      if (acceptedFiles.length > 0) {
        // For preview
        const previewUrl = URL.createObjectURL(acceptedFiles[0]);
        setBannerPreview(previewUrl);
        
        // In a real app, you'd upload this to a storage service and get back a URL
        // For now, we'll simulate this by storing the object URL
        setFormData({
          ...formData,
          bannerImage: previewUrl
        });
      }
    }
  });
  
  // Handle emoji selection
  const onEmojiClick = (emojiData: EmojiClickData) => {
    setFormData({
      ...formData,
      icon: emojiData.emoji,
    });
    setShowEmojiPicker(false);
  };
  
  // Remove banner
  const removeBanner = () => {
    if (bannerPreview && bannerPreview !== project?.bannerImage) {
      URL.revokeObjectURL(bannerPreview);
    }
    setBannerPreview(null);
    setFormData({
      ...formData,
      bannerImage: null
    });
  };
  
  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: updateProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setFormError(null);
    },
    onError: (error) => {
      setFormError(`Update Error: ${error.message}`);
    },
  });
  
  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      // Navigate to projects page after successful deletion
      window.location.href = "/project-manager/projects";
    },
    onError: (error) => {
      setFormError(`Delete Error: ${error.message}`);
      setShowDeleteConfirm(false);
    },
  });
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    if (!formData.name.trim()) {
      setFormError("Project name is required");
      return;
    }
    
    updateProjectMutation.mutate({
      id: projectId,
      name: formData.name,
      description: formData.description || null,
      icon: formData.icon,
      bannerImage: formData.bannerImage,
    });
  };
  
  // Handle project deletion
  const handleDelete = () => {
    deleteProjectMutation.mutate(projectId);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-neutral-400">Loading project settings...</p>
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
  
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6 flex items-center">
        <Link
          to="/project-manager/project/$projectId"
          params={{ projectId }}
          className="mr-4 p-2 rounded-full hover:bg-neutral-800 cursor-pointer"
        >
          <ChevronLeft className="h-5 w-5 text-neutral-400" />
        </Link>
        <h1 className="text-2xl font-bold text-neutral-100 flex items-center">
          <Settings className="h-6 w-6 mr-2" /> Project Settings
        </h1>
      </div>
      
      {/* Display form errors */}
      {formError && (
        <div className="p-4 bg-red-900/20 border border-red-700 rounded-md mb-6">
          <p className="text-red-400">{formError}</p>
        </div>
      )}
      
      <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-neutral-200 mb-4">Project Information</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Banner Image */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-300">
              Banner Image
            </label>
            <div>
              {bannerPreview ? (
                <div className="relative h-48 w-full overflow-hidden rounded-md">
                  <img 
                    src={bannerPreview} 
                    alt="Banner preview" 
                    className="h-full w-full object-cover"
                  />
                  <button 
                    onClick={removeBanner}
                    type="button"
                    className="absolute right-2 top-2 rounded-full bg-black/60 p-2 cursor-pointer"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
              ) : (
                <div 
                  {...getRootProps()} 
                  className={`cursor-pointer border-2 border-dashed rounded-md p-8 text-center hover:bg-neutral-700/10 transition-colors ${
                    isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-neutral-600'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Image className="mx-auto h-12 w-12 text-neutral-500" />
                  <p className="mt-2 text-neutral-400">
                    Drag & drop an image, or click to select
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Project Icon */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-300">
              Project Icon
            </label>
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-md border border-neutral-600 text-2xl">
                {formData.icon}
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="inline-flex items-center rounded-md border border-neutral-600 bg-neutral-700 px-4 py-2 text-sm font-medium text-neutral-200 hover:bg-neutral-600 cursor-pointer"
                >
                  <Smile className="mr-2 h-4 w-4" />
                  Select Emoji
                </button>
                {showEmojiPicker && (
                  <div className="absolute top-full mt-2 z-10">
                    <EmojiPicker onEmojiClick={onEmojiClick} />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Project Name */}
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-neutral-300">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-md border border-neutral-600 bg-neutral-700 px-3 py-2 text-neutral-100 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-text"
              required
            />
          </div>
          
          {/* Project Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-neutral-300">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full rounded-md border border-neutral-600 bg-neutral-700 px-3 py-2 text-neutral-100 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-text"
            />
          </div>
          
          {/* Action Buttons */}
          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="submit"
              disabled={updateProjectMutation.isPending}
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Save className="mr-2 h-4 w-4" />
              {updateProjectMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
      
      {/* Danger Zone */}
      <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-red-400 mb-4">Danger Zone</h2>
        <p className="text-neutral-400 mb-4">
          Once you delete a project, there is no going back. Please be certain.
        </p>
        
        {!showDeleteConfirm ? (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center rounded-md border border-red-700 bg-neutral-800 px-4 py-2 text-red-400 hover:bg-red-900/20 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none cursor-pointer"
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete Project
          </button>
        ) : (
          <div className="border border-red-700 rounded-md p-4 bg-red-900/10">
            <p className="text-red-400 mb-4">
              Are you sure you want to delete this project? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-md bg-neutral-700 px-4 py-2 text-neutral-200 hover:bg-neutral-600 focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 focus:outline-none cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteProjectMutation.isPending}
                className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {deleteProjectMutation.isPending ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AddProjectDialog } from "~/components/providers/add-project";
import { PlusIcon } from "lucide-react";

// Define the type for a project based on schema/API response
// Adjust based on the actual structure returned by your API
type Project = {
  id: string; // Assuming UUID string from schema
  name: string;
  description?: string | null;
  banner?: string | null; // Added banner field
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

export const Route = createFileRoute("/project-manager/projects")({
  component: RouteComponent,
  loader: ({ context }) => {
    // Prefetch projects data to ensure it's available immediately
    context.queryClient.prefetchQuery({
      queryKey: ["projects"],
      queryFn: fetchProjects,
    });
    return {};
  },
});

function RouteComponent() {
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 6;

  // Dialog state
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);

  // Query for fetching projects with minimal stale time to ensure fresh data
  const {
    data: projectsData,
    isLoading,
    error: projectsError,
    refetch
  } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
    staleTime: 0, // Always refetch when component mounts
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Ensure data is loaded when component mounts
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Calculate pagination
  const totalProjects = projectsData?.projects?.length || 0;
  const totalPages = Math.ceil(totalProjects / projectsPerPage);
  
  // Get current projects for this page
  const currentProjects = projectsData?.projects?.slice(
    (currentPage - 1) * projectsPerPage,
    currentPage * projectsPerPage
  ) || [];

  // Make sure we always show exactly 6 card placeholders, even when loading
  const displayProjects = isLoading
    ? Array(projectsPerPage).fill(null)
    : currentProjects.length < projectsPerPage
    ? [...currentProjects, ...Array(projectsPerPage - currentProjects.length).fill(null)]
    : currentProjects;

  return (
    <div className="container mx-auto w-[90%] px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-neutral-100">Projects</h1>
     
      {/* Project List */}
      <div className="h-full">
        <h2 className="mb-4 text-xl font-semibold text-neutral-200">Project List</h2>

        {projectsError && (
          <p className="mb-4 text-red-400">Error loading projects: {projectsError.message}</p>
        )}

        {isLoading && <p className="text-neutral-400 cursor-wait">Loading projects...</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-[calc(100vh-250px)] max-h-[800px] overflow-hidden">
          {displayProjects.map((project, index) => (
            <div
              key={project?.id || `placeholder-${index}`}
              className="rounded-lg border shadow-sm border-neutral-700 bg-neutral-800 transition-all overflow-hidden h-[280px] flex flex-col"
            >
              {isLoading ? (
                // Loading placeholder
                <div className="animate-pulse flex flex-col h-full">
                  <div className="h-32 bg-neutral-700"></div>
                  <div className="p-5 flex-1">
                    <div className="h-5 bg-neutral-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-neutral-700 rounded w-1/4 mb-4"></div>
                    <div className="h-4 bg-neutral-700 rounded w-full mb-3"></div>
                    <div className="h-3 bg-neutral-700 rounded w-2/3 mb-5"></div>
                  </div>
                </div>
              ) : project === null ? (
                // Empty card placeholder that opens add project dialog when clicked
                <div 
                  onClick={() => setIsAddProjectOpen(true)}
                  className="flex flex-col items-center justify-center h-full border-dashed border-2 border-neutral-700 bg-neutral-800/50 hover:bg-neutral-700/30 transition-colors cursor-pointer"
                >
                  <PlusIcon className="h-10 w-10 text-neutral-500 mb-2" />
                  <p className="text-neutral-500">Add project</p>
                </div>
              ) : (
                // Project card display
                <>
                  {/* Banner */}
                  <div className="relative h-32 bg-gradient-to-r from-blue-600 to-purple-600 cursor-pointer">
                    {project.banner && (
                      <img 
                        src={project.banner} 
                        alt={`${project.name} banner`} 
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    )}
                    {/* Clickable overlay for the entire card */}
                    <Link 
                      to="/project-manager/project/$projectId" 
                      params={{ projectId: project.id }}
                      className="absolute inset-0 w-full h-full z-10"
                    >
                      <span className="sr-only">View project {project.name}</span>
                    </Link>
                  </div>
                  
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-medium text-neutral-200 line-clamp-1">
                          {project.name}
                        </h3>
                        <p className="text-xs text-neutral-500 mb-1">
                          ID: {project.id.substring(0, 8)}...
                        </p>
                      </div>
                    </div>
                    
                    <p className="mb-3 text-neutral-400 line-clamp-2">
                      {project.description || "No description"}
                    </p>
                    <p className="text-xs text-neutral-500 mb-2">
                      Created: {new Date(project.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 space-x-1">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-md bg-neutral-700 text-neutral-200 hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded-md ${
                  currentPage === page
                    ? "bg-blue-600 text-white"
                    : "bg-neutral-700 text-neutral-200 hover:bg-neutral-600"
                } cursor-pointer`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-md bg-neutral-700 text-neutral-200 hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Next
            </button>
          </div>
        )}
      </div>
      
      {/* Add Project Dialog */}
      <AddProjectDialog 
        isOpen={isAddProjectOpen} 
        onOpenChange={setIsAddProjectOpen} 
      />
    </div>
  );
}

import { trpc } from '@/lib/trpc'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import type { ProjectFormData } from '@workspace/ui/components/dashboard/project-manager/project-form'
import { ProjectForm } from '@workspace/ui/components/dashboard/project-manager/project-form'
import type { Project } from '@workspace/ui/components/dashboard/project-manager/project-list'
import { ProjectList } from '@workspace/ui/components/dashboard/project-manager/project-list'
import ViewContainer from '@workspace/ui/components/dashboard/project-manager/view-container'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@workspace/ui/components/dialog'
import { Plus, Search } from 'lucide-react'
import React from 'react'
import { useUser } from '../__root'
import { ViewContext } from '../project-manager'

export const Route = createFileRoute('/project-manager/projects')({
  component: RouteComponent,
})


function RouteComponent() {
  const navigate = useNavigate()
  const user = useUser()
  const { activeView, setActiveView } = React.useContext(ViewContext)
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false)
  const [editingProject, setEditingProject] = React.useState<Project | null>(null)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [currentPage, setCurrentPage] = React.useState(1)
  const projectsPerPage = 6

  // tRPC queries and mutations
  const projectsQuery = trpc.projects.list.useQuery(undefined, {
    staleTime: 1000 * 60, // 1 minute
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  })
  const createProjectMutation = trpc.projects.create.useMutation({
    onSuccess: () => {
      projectsQuery.refetch()
      setIsCreateModalOpen(false)
    }
  })
  const updateProjectMutation = trpc.projects.update.useMutation({
    onSuccess: () => {
      projectsQuery.refetch()
      setIsEditModalOpen(false)
      setEditingProject(null)
    }
  })
  const deleteProjectMutation = trpc.projects.delete.useMutation({
    onSuccess: () => {
      projectsQuery.refetch()
    }
  })

  // Refetch projects after mutations
  const refetchProjects = () => {
    projectsQuery.refetch()
  }

  const handleCreateProject = async (data: ProjectFormData) => {
    try {
      await createProjectMutation.mutateAsync({
        name: data.name,
        description: data.description || undefined,
        icon: data.icon || undefined,
        cover: data.cover || undefined,
        startDate: data.startDate || undefined,
        dueDate: data.dueDate || undefined,
        status: data.status as any,
        parentProjectId: data.parentProjectId || undefined,
      })
    } catch (error) {
      console.error('Failed to create project:', error)
    }
  }

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
    setIsEditModalOpen(true)
  }

  const handleUpdateProject = async (data: ProjectFormData) => {
    if (!editingProject) return
    
    try {
      await updateProjectMutation.mutateAsync({
        id: editingProject.id,
        name: data.name,
        description: data.description || undefined,
        icon: data.icon || undefined,
        cover: data.cover || undefined,
        startDate: data.startDate || undefined,
        dueDate: data.dueDate || undefined,
        status: data.status as any,
        parentProjectId: data.parentProjectId || undefined,
      })
    } catch (error) {
      console.error('Failed to update project:', error)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return
    
    try {
      await deleteProjectMutation.mutateAsync({ id: projectId })
    } catch (error) {
      console.error('Failed to delete project:', error)
    }
  }

  const handleProjectSettings = (projectId: string) => {
    // Navigate to project settings page
    navigate({ to: `/project-manager/projects/${projectId}/settings` })
  }

  // Prepare and filter data
  const allProjects: Project[] = React.useMemo(() => {
    return (projectsQuery.data || []).map(project => ({
      ...project,
      startDate: project.startDate ? new Date(project.startDate) : null,
      dueDate: project.dueDate ? new Date(project.dueDate) : null,
      createdAt: new Date(project.createdAt),
      updatedAt: new Date(project.updatedAt),
    }))
  }, [projectsQuery.data])

  // Filter projects based on search term
  const filteredProjects = React.useMemo(() => {
    if (!searchTerm) return allProjects
    return allProjects.filter(project =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [allProjects, searchTerm])

  // Pagination logic
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage)
  const startIndex = (currentPage - 1) * projectsPerPage
  const paginatedProjects = filteredProjects.slice(startIndex, startIndex + projectsPerPage)

  // Reset pagination when search changes
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])
  
  const projectOptions = allProjects.map(p => ({ id: p.id, name: p.name }))

  const initialEditData = editingProject ? {
    id: editingProject.id,
    name: editingProject.name,
    description: editingProject.description || '',
    icon: editingProject.icon || '📁',
    cover: editingProject.cover || '',
    startDate: editingProject.startDate ? 
      new Date(editingProject.startDate).toISOString().split('T')[0] : '',
    dueDate: editingProject.dueDate ? 
      new Date(editingProject.dueDate).toISOString().split('T')[0] : '',
    status: editingProject.status,
    parentProjectId: editingProject.parentProjectId || undefined,
  } : undefined

  // Log when activeView changes
  React.useEffect(() => {
    console.log('Projects component: Active view is now:', activeView)
  }, [activeView])
  
  // Listen for global view changes
  React.useEffect(() => {
    const handleViewTypeChange = (event: CustomEvent) => {
      if (event.detail && event.detail.viewType) {
        console.log('Projects component: Received view change event:', event.detail.viewType)
        if (setActiveView) {
          setActiveView(event.detail.viewType)
        }
      }
    };
    
    // Add event listener
    window.addEventListener('viewTypeChanged', handleViewTypeChange as EventListener)
    
    // Clean up
    return () => {
      window.removeEventListener('viewTypeChanged', handleViewTypeChange as EventListener)
    }
  }, [setActiveView])

  // Render appropriate view or classic list based on activeView
  const renderProjectView = () => {
    // Show loading state
    if (projectsQuery.isLoading) {
      return (
        <div className="min-h-[600px] flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 border-4 border-stone-200 border-t-stone-600 rounded-full animate-spin"></div>
            <p className="text-stone-600">Loading projects...</p>
          </div>
        </div>
      )
    }
    
    // Show error state
    if (projectsQuery.isError) {
      return (
        <div className="min-h-[600px] flex items-center justify-center">
          <div className="bg-red-50 border border-red-200 rounded-md p-6 max-w-lg">
            <h3 className="text-red-800 font-medium text-lg mb-2">Error loading projects</h3>
            <p className="text-red-700">
              {projectsQuery.error?.message || 'An unexpected error occurred. Please try again.'}
            </p>
            <button 
              onClick={() => projectsQuery.refetch()}
              className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-md transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )
    }
    
    // No projects found
    if (filteredProjects.length === 0) {
      return (
        <div className="min-h-[600px] flex items-center justify-center">
          <div className="bg-stone-50 border border-stone-200 rounded-md p-6 max-w-lg text-center">
            <h3 className="text-stone-800 font-medium text-lg mb-2">
              {searchTerm ? 'No matching projects found' : 'No projects yet'}
            </h3>
            <p className="text-stone-600 mb-4">
              {searchTerm 
                ? `No projects matching "${searchTerm}" were found.` 
                : "Let's create your first project to get started."}
            </p>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Create New Project
            </button>
          </div>
        </div>
      )
    }
    
    // For legacy/classic view
    if (activeView === 'classic') {
      return (
        <div className="h-[93vh] w-[97.1vw]">
          <ProjectList
            projects={paginatedProjects}
            onEdit={handleEditProject}
            onDelete={handleDeleteProject}
            onCreateProject={() => setIsCreateModalOpen(true)}
            onProjectSettings={handleProjectSettings}
            isLoading={projectsQuery.isLoading}
          />
        </div>
      )
    }
    
    // For new view types (kanban, list, table, etc.)
    return (
      <div className="h-[93vh] w-[97.1vw]">
        <ViewContainer 
          key={`view-${activeView}`} 
          viewType={activeView} 
          data={filteredProjects} 
          onStatusChange={async (projectId, newStatus) => {
            try {
              // Find the project to update
              const project = filteredProjects.find(p => p.id === projectId);
              if (!project) {
                console.error(`Project not found: ${projectId}`);
                return;
              }
              
              console.log(`Attempting status update: ${project.status} -> ${newStatus}`);
              
              // Validate the status is one of the accepted values
              const validStatuses = ['backlog', 'todo', 'in_progress', 'done', 'on_hold'];
              if (!validStatuses.includes(newStatus)) {
                console.error(`Invalid status value: ${newStatus}`);
                return;
              }
              
              // Update the project status
              await updateProjectMutation.mutateAsync({
                id: projectId,
                status: newStatus as 'backlog' | 'todo' | 'in_progress' | 'done' | 'on_hold',
              });
              
              console.log(`Successfully updated project ${projectId} status to ${newStatus}`);
            } catch (error) {
              console.error('Failed to update project status:', error);
            }
          }}
        />
      </div>
    )
  }

  return (
    <div className=" h-[93vh] w-[97.1vw]">
      {/* Header with Project Count */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-500 mt-1">
            {projectsQuery.isLoading 
              ? 'Loading projects...' 
              : `${filteredProjects.length} project${filteredProjects.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            disabled={createProjectMutation.isPending}
            className="flex items-center gap-1"
          >
            {createProjectMutation.isPending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
            ) : (
              <Plus className="h-4 w-4" />
            )}
            New Project
          </Button>
        </div>
      </div>
      
      {/* Projects View (Dynamic based on active view) */}
      {renderProjectView()}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-xs text-gray-700">
            Showing {startIndex + 1} to {Math.min(startIndex + projectsPerPage, filteredProjects.length)} of {filteredProjects.length} projects
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-xs text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Create Project Dialog */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <ProjectForm
            mode="create"
            user={user}
            onSubmit={handleCreateProject}
            onCancel={() => setIsCreateModalOpen(false)}
            projects={projectOptions}
            isLoading={createProjectMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog 
        open={isEditModalOpen} 
        onOpenChange={(open) => {
          setIsEditModalOpen(open)
          if (!open) setEditingProject(null)
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <ProjectForm
            mode="edit"
            user={user}
            initialData={initialEditData}
            onSubmit={handleUpdateProject}
            onCancel={() => {
              setIsEditModalOpen(false)
              setEditingProject(null)
            }}
            projects={projectOptions.filter(p => p.id !== editingProject?.id)}
            isLoading={updateProjectMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

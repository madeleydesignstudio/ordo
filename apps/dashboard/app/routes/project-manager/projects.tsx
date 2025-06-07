import { createFileRoute } from '@tanstack/react-router'
import { Plus, Search } from 'lucide-react'
import React from 'react'
import { ProjectForm } from '@workspace/ui/components/dashboard/project-manager/project-form'
import { ProjectList } from '@workspace/ui/components/dashboard/project-manager/project-list'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@workspace/ui/components/dialog'
import { Button } from '@workspace/ui/components/button'
import type { ProjectFormData } from '@workspace/ui/components/dashboard/project-manager/project-form'
import type { Project } from '@workspace/ui/components/dashboard/project-manager/project-list'
import { trpc } from '@/lib/trpc'
import { useNavigate } from '@tanstack/react-router'
import { useUser } from '../__root'

export const Route = createFileRoute('/project-manager/projects')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const user = useUser()
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false)
  const [editingProject, setEditingProject] = React.useState<Project | null>(null)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [currentPage, setCurrentPage] = React.useState(1)
  const projectsPerPage = 6

  // tRPC queries and mutations
  const projectsQuery = trpc.projects.list.useQuery()
  const createProjectMutation = trpc.projects.create.useMutation()
  const updateProjectMutation = trpc.projects.update.useMutation()
  const deleteProjectMutation = trpc.projects.delete.useMutation()

  // Refetch projects after mutations
  const refetchProjects = () => {
    projectsQuery.refetch()
  }

  const handleCreateProject = async (data: ProjectFormData) => {
    try {
      await createProjectMutation.mutateAsync({
        name: data.name,
        description: data.description,
        icon: data.icon,
        cover: data.cover,
        startDate: data.startDate,
        dueDate: data.dueDate,
        status: data.status,
        parentProjectId: data.parentProjectId,
      })
      setIsCreateModalOpen(false)
      refetchProjects()
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
        description: data.description,
        icon: data.icon,
        cover: data.cover,
        startDate: data.startDate,
        dueDate: data.dueDate,
        status: data.status,
        parentProjectId: data.parentProjectId,
      })
      setIsEditModalOpen(false)
      setEditingProject(null)
      refetchProjects()
    } catch (error) {
      console.error('Failed to update project:', error)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return
    
    try {
      await deleteProjectMutation.mutateAsync({ id: projectId })
      refetchProjects()
    } catch (error) {
      console.error('Failed to delete project:', error)
    }
  }

  const handleProjectSettings = (projectId: string) => {
    // Navigate to project settings page
    navigate({ to: `/project-manager/projects/${projectId}/settings` })
  }

  // Prepare and filter data
  const allProjects: Project[] = (projectsQuery.data || []).map(project => ({
    ...project,
    startDate: project.startDate ? new Date(project.startDate) : null,
    dueDate: project.dueDate ? new Date(project.dueDate) : null,
    createdAt: new Date(project.createdAt),
    updatedAt: new Date(project.updatedAt),
  }))

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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        </div>
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
      </div>

      {/* Search Bar */}
      <div className="mb-6">
     
      </div>
      
      {/* Projects List */}
      <div className="min-h-[600px]">
        <ProjectList
          projects={paginatedProjects}
          onEdit={handleEditProject}
          onDelete={handleDeleteProject}
          onCreateProject={() => setIsCreateModalOpen(true)}
          onProjectSettings={handleProjectSettings}
          isLoading={projectsQuery.isLoading}
        />
      </div>

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

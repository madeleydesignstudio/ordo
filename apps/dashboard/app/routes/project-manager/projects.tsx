import { createFileRoute } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import React from 'react'
import { ProjectForm } from '@workspace/ui/components/dashboard/project-manager/project-form'
import { ProjectList } from '@workspace/ui/components/dashboard/project-manager/project-list'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@workspace/ui/components/dialog'
import type { ProjectFormData } from '@workspace/ui/components/dashboard/project-manager/project-form'
import type { Project } from '@workspace/ui/components/dashboard/project-manager/project-list'
import { trpc } from '@/lib/trpc'

export const Route = createFileRoute('/project-manager/projects')({
  component: RouteComponent,
})

function RouteComponent() {
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false)
  const [editingProject, setEditingProject] = React.useState<Project | null>(null)

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

  // Prepare data for forms - convert tRPC response to Project type
  const projects: Project[] = (projectsQuery.data || []).map(project => ({
    ...project,
    startDate: project.startDate ? new Date(project.startDate) : null,
    dueDate: project.dueDate ? new Date(project.dueDate) : null,
    createdAt: new Date(project.createdAt),
    updatedAt: new Date(project.updatedAt),
  }))
  
  const projectOptions = projects.map(p => ({ id: p.id, name: p.name }))

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
    <div className="p-6">
      {/* Header with Add Project Button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-1">
            Manage your projects and track their progress
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Project
        </button>
      </div>
      
      {/* Projects List */}
      <ProjectList
        projects={projects}
        onEdit={handleEditProject}
        onDelete={handleDeleteProject}
        isLoading={projectsQuery.isLoading}
      />

      {/* Create Project Dialog */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <ProjectForm
            mode="create"
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

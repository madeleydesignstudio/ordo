import { createFileRoute } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import React from 'react'
import { TaskForm } from '@workspace/ui/components/dashboard/project-manager/task-form'
import { TaskList } from '@workspace/ui/components/dashboard/project-manager/task-list'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@workspace/ui/components/dialog'
import type { TaskFormData } from '@workspace/ui/components/dashboard/project-manager/task-form'
import type { Task } from '@workspace/ui/components/dashboard/project-manager/task-list'
import { trpc } from '@/lib/trpc'

export const Route = createFileRoute('/project-manager/tasks')({
  component: RouteComponent,
})

function RouteComponent() {
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false)
  const [editingTask, setEditingTask] = React.useState<Task | null>(null)
  const [activeFilter, setActiveFilter] = React.useState<'inbox' | 'today' | 'upcoming' | 'filtered'>('inbox')

  // tRPC queries and mutations
  const tasksQuery = trpc.tasks.list.useQuery()
  const projectsQuery = trpc.projects.list.useQuery()
  const createTaskMutation = trpc.tasks.create.useMutation()
  const updateTaskMutation = trpc.tasks.update.useMutation()
  const deleteTaskMutation = trpc.tasks.delete.useMutation()

  // Refetch tasks after mutations
  const refetchTasks = () => {
    tasksQuery.refetch()
  }

  const handleCreateTask = async (data: TaskFormData) => {
    try {
      await createTaskMutation.mutateAsync({
        name: data.name,
        description: data.description,
        startDate: data.startDate,
        dueDate: data.dueDate,
        status: data.status,
        priority: data.priority,
        labels: data.labels,
        projectId: data.projectId,
        parentTaskId: data.parentTaskId,
      })
      setIsCreateModalOpen(false)
      refetchTasks()
    } catch (error) {
      console.error('Failed to create task:', error)
    }
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsEditModalOpen(true)
  }

  const handleUpdateTask = async (data: TaskFormData) => {
    if (!editingTask) return
    
    try {
      await updateTaskMutation.mutateAsync({
        id: editingTask.id,
        name: data.name,
        description: data.description,
        startDate: data.startDate,
        dueDate: data.dueDate,
        status: data.status,
        priority: data.priority,
        labels: data.labels,
        projectId: data.projectId,
        parentTaskId: data.parentTaskId,
      })
      setIsEditModalOpen(false)
      setEditingTask(null)
      refetchTasks()
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return
    
    try {
      await deleteTaskMutation.mutateAsync({ id: taskId })
      refetchTasks()
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  // Prepare data for forms - convert tRPC responses to proper types
  const tasks: Task[] = (tasksQuery.data || []).map(task => ({
    ...task,
    startDate: task.startDate ? new Date(task.startDate) : null,
    dueDate: task.dueDate ? new Date(task.dueDate) : null,
    labels: task.labels || [],
    createdAt: new Date(task.createdAt),
    updatedAt: new Date(task.updatedAt),
  }))

  // Filter tasks based on active filter
  const filteredTasks = React.useMemo(() => {
    const today = new Date()
    today.setHours(23, 59, 59, 999) // End of today
    
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0) // Start of today

    switch (activeFilter) {
      case 'inbox':
        // Tasks not assigned to any project
        return tasks.filter(task => !task.projectId)
      
      case 'today':
        // Tasks due today or overdue (including tasks with no due date but status is not done)
        return tasks.filter(task => {
          if (!task.dueDate) {
            // Include tasks without due date that are not completed
            return task.status !== 'done'
          }
          // Include tasks due today or overdue
          return task.dueDate <= today
        })
      
      case 'upcoming':
        // Tasks due in the future
        return tasks.filter(task => {
          if (!task.dueDate) return false
          return task.dueDate > today
        })
      
      default:
        return tasks
    }
  }, [tasks, activeFilter])

  const projects = (projectsQuery.data || []).map(project => ({
    id: project.id,
    name: project.name,
  }))

  const taskOptions = tasks.map(t => ({ id: t.id, name: t.name }))

  const initialEditData = editingTask ? {
    id: editingTask.id,
    name: editingTask.name,
    description: editingTask.description || '',
    startDate: editingTask.startDate ? 
      new Date(editingTask.startDate).toISOString().split('T')[0] : '',
    dueDate: editingTask.dueDate ? 
      new Date(editingTask.dueDate).toISOString().split('T')[0] : '',
    status: editingTask.status,
    priority: editingTask.priority,
    labels: editingTask.labels,
    projectId: editingTask.projectId || undefined,
    parentTaskId: editingTask.parentTaskId || undefined,
  } : undefined

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header with Add Task Button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
        </div>
      
      </div>

      {/* Secondary Navigation */}
      <div className="mb-6 ">
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg w-fit">
          {[
            { key: 'inbox', label: 'Inbox' },
            { key: 'today', label: 'Today' },
            { key: 'upcoming', label: 'Upcoming' },
         
          ].map((filter) => {
            // Calculate task counts for each filter
            const getTaskCount = (filterKey: string) => {
              const today = new Date()
              today.setHours(23, 59, 59, 999)
              
              switch (filterKey) {
                case 'inbox':
                  return tasks.filter(task => !task.projectId).length
                case 'today':
                  return tasks.filter(task => {
                    if (!task.dueDate) {
                      return task.status !== 'done'
                    }
                    return task.dueDate <= today
                  }).length
                case 'upcoming':
                  return tasks.filter(task => {
                    if (!task.dueDate) return false
                    return task.dueDate > today
                  }).length
                default:
                  return 0
              }
            }

            const taskCount = getTaskCount(filter.key)

            return (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key as typeof activeFilter)}
                className={`px-4 py-2 font-medium rounded-md text-xs transition-colors flex items-center gap-2 ${
                  activeFilter === filter.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {filter.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeFilter === filter.key
                    ? 'bg-gray-200 text-gray-700'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {taskCount}
                </span>
              </button>
            )
          })}
        </div>
      </div>
      
      {/* Tasks List */}
      <TaskList
        tasks={filteredTasks}
        projects={projects}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
        onCreateTask={() => setIsCreateModalOpen(true)}
        isLoading={tasksQuery.isLoading}
      />

      {/* Create Task Dialog */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <TaskForm
            mode="create"
            onSubmit={handleCreateTask}
            onCancel={() => setIsCreateModalOpen(false)}
            projects={projects}
            tasks={taskOptions}
            isLoading={createTaskMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog 
        open={isEditModalOpen} 
        onOpenChange={(open) => {
          setIsEditModalOpen(open)
          if (!open) setEditingTask(null)
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <TaskForm
            mode="edit"
            initialData={initialEditData}
            onSubmit={handleUpdateTask}
            onCancel={() => {
              setIsEditModalOpen(false)
              setEditingTask(null)
            }}
            projects={projects}
            tasks={taskOptions.filter(t => t.id !== editingTask?.id)}
            isLoading={updateTaskMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

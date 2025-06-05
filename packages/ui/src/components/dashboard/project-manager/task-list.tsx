"use client"

import { Calendar, Edit, MoreHorizontal, Plus, Tag, Trash2 } from 'lucide-react'
import { Button } from '../../button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../dropdown-menu'

export interface Task {
  id: string
  name: string
  description?: string | null
  startDate?: Date | null
  dueDate?: Date | null
  status: 'backlog' | 'todo' | 'in_progress' | 'done' | 'on_hold'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  labels: string[]
  projectId?: string | null
  parentTaskId?: string | null
  createdAt: Date
  updatedAt: Date
}

interface TaskListProps {
  tasks: Task[]
  projects?: Array<{ id: string; name: string }>
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  onCreateTask?: () => void
  isLoading?: boolean
}

const statusConfig = {
  backlog: { label: 'Backlog', color: 'bg-gray-100 text-gray-700', dot: 'bg-gray-500' },
  todo: { label: 'To Do', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  done: { label: 'Done', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  on_hold: { label: 'On Hold', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
}

const priorityConfig = {
  low: { label: 'Low', color: 'text-green-600', icon: '▼' },
  medium: { label: 'Medium', color: 'text-yellow-600', icon: '▶' },
  high: { label: 'High', color: 'text-orange-600', icon: '▲' },
  urgent: { label: 'Urgent', color: 'text-red-600', icon: '⚠️' },
}

function formatDate(date: Date | null | undefined): string {
  if (!date) return ''
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(date))
}

export function TaskList({ tasks, projects = [], onEdit, onDelete, onCreateTask, isLoading }: TaskListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="border-b rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">No tasks found</div>
        <img src="https://storage.dev-0af.workers.dev/architect.png" alt="Empty state" className="w-1/4 mx-auto" />
        <div className="text-gray-400 text-sm mb-4">Create your first task to get started</div>
        {/* Create Task Button */}
        {onCreateTask && (
          <Button
            onClick={onCreateTask}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Task
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const status = statusConfig[task.status]
        const priority = priorityConfig[task.priority]
        const project = projects.find(p => p.id === task.projectId)
        
        return (
          <div 
            key={task.id} 
            className="border-b rounded-lg p-4 cursor-pointer group"
            onClick={() => onEdit(task)}
          >
            {/* Task Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-gray-900 line-clamp-1">
                    {task.name}
                  </h3>
                  
                  {/* Status Badge */}
                  <div className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${status.dot}`}></span>
                    <span className={`text-xs px-2 py-1 rounded-full ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  
                  {/* Priority Badge */}
                  <div className={`flex items-center gap-1 text-xs ${priority.color}`}>
                    <span>{priority.icon}</span>
                    <span>{priority.label}</span>
                  </div>
                </div>
                
                {/* Description */}
                {task.description && (
                  <p className="text-gray-600 text-sm mb-2 line-clamp-1">
                    {task.description}
                  </p>
                )}
              </div>
              
              {/* Actions Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(task)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete(task.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Task Meta Information */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
              {/* Project */}
              {project && (
                <div className="flex items-center gap-1">
                  <span className="font-medium">Project:</span>
                  <span>{project.name}</span>
                </div>
              )}
              
              {/* Dates */}
              {task.startDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Start: {formatDate(task.startDate)}</span>
                </div>
              )}
              {task.dueDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Due: {formatDate(task.dueDate)}</span>
                </div>
              )}
              
              {/* Created Date */}
              <div className="flex items-center gap-1">
                <span>Created: {formatDate(task.createdAt)}</span>
              </div>
            </div>

            {/* Labels */}
            {task.labels.length > 0 && (
              <div className="flex items-center gap-2 mt-3">
                <Tag className="h-3 w-3 text-gray-400" />
                <div className="flex flex-wrap gap-1">
                  {task.labels.map((label) => (
                    <span
                      key={label}
                      className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-md"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
} 
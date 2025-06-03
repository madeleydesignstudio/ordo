"use client"

import React from 'react'
import { Button } from '../../button'
import { Input } from '../../input'
import { Label } from '../../label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../dropdown-menu'
import { X } from 'lucide-react'

// Task form data interface
export interface TaskFormData {
  id?: string
  name: string
  description?: string
  startDate?: string
  dueDate?: string
  status: 'backlog' | 'todo' | 'in_progress' | 'done' | 'on_hold'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  labels: string[]
  projectId?: string
  parentTaskId?: string
}

interface TaskFormProps {
  initialData?: Partial<TaskFormData>
  projects?: Array<{ id: string; name: string }>
  tasks?: Array<{ id: string; name: string }> // For parent task selection
  onSubmit: (data: TaskFormData) => void
  onCancel: () => void
  isLoading?: boolean
  mode: 'create' | 'edit'
}

const statusOptions = [
  { value: 'backlog', label: 'Backlog', color: 'text-gray-600' },
  { value: 'todo', label: 'To Do', color: 'text-blue-600' },
  { value: 'in_progress', label: 'In Progress', color: 'text-yellow-600' },
  { value: 'done', label: 'Done', color: 'text-green-600' },
  { value: 'on_hold', label: 'On Hold', color: 'text-red-600' },
] as const

const priorityOptions = [
  { value: 'low', label: 'Low', color: 'text-green-600' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
  { value: 'high', label: 'High', color: 'text-orange-600' },
  { value: 'urgent', label: 'Urgent', color: 'text-red-600' },
] as const

export function TaskForm({
  initialData = {},
  projects = [],
  tasks = [],
  onSubmit,
  onCancel,
  isLoading = false,
  mode,
}: TaskFormProps) {
  const [formData, setFormData] = React.useState<TaskFormData>({
    name: '',
    status: 'backlog',
    priority: 'medium',
    labels: [],
    ...initialData,
  })

  const [newLabel, setNewLabel] = React.useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const updateField = (field: keyof TaskFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addLabel = () => {
    if (newLabel.trim() && !formData.labels.includes(newLabel.trim())) {
      updateField('labels', [...formData.labels, newLabel.trim()])
      setNewLabel('')
    }
  }

  const removeLabel = (labelToRemove: string) => {
    updateField('labels', formData.labels.filter(label => label !== labelToRemove))
  }

  const handleLabelKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addLabel()
    }
  }

  const selectedStatus = statusOptions.find(opt => opt.value === formData.status)
  const selectedPriority = priorityOptions.find(opt => opt.value === formData.priority)
  const selectedProject = projects.find(p => p.id === formData.projectId)
  const selectedParentTask = tasks.find(t => t.id === formData.parentTaskId)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Task Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Task Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => updateField('name', e.target.value)}
          placeholder="Enter task name"
          required
        />
      </div>

      {/* Task Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="Enter task description"
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      {/* Dates Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Start Date */}
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate || ''}
            onChange={(e) => updateField('startDate', e.target.value)}
          />
        </div>

        {/* Due Date */}
        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date</Label>
          <Input
            id="dueDate"
            type="date"
            value={formData.dueDate || ''}
            onChange={(e) => updateField('dueDate', e.target.value)}
          />
        </div>
      </div>

      {/* Status and Priority Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Status */}
        <div className="space-y-2">
          <Label>Status</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <span className={`mr-2 ${selectedStatus?.color}`}>●</span>
                {selectedStatus?.label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {statusOptions.map((status) => (
                <DropdownMenuItem
                  key={status.value}
                  onClick={() => updateField('status', status.value)}
                >
                  <span className={`mr-2 ${status.color}`}>●</span>
                  {status.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Priority */}
        <div className="space-y-2">
          <Label>Priority</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <span className={`mr-2 ${selectedPriority?.color}`}>▲</span>
                {selectedPriority?.label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {priorityOptions.map((priority) => (
                <DropdownMenuItem
                  key={priority.value}
                  onClick={() => updateField('priority', priority.value)}
                >
                  <span className={`mr-2 ${priority.color}`}>▲</span>
                  {priority.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Labels */}
      <div className="space-y-2">
        <Label>Labels</Label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Add a label"
              onKeyPress={handleLabelKeyPress}
            />
            <Button type="button" onClick={addLabel} variant="outline">
              Add
            </Button>
          </div>
          {formData.labels.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.labels.map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-md"
                >
                  {label}
                  <button
                    type="button"
                    onClick={() => removeLabel(label)}
                    className="hover:text-blue-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Project and Parent Task Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Project Assignment */}
        <div className="space-y-2">
          <Label>Project</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                {selectedProject?.name || 'No project assigned'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => updateField('projectId', undefined)}>
                No project assigned
              </DropdownMenuItem>
              {projects.map((project) => (
                <DropdownMenuItem
                  key={project.id}
                  onClick={() => updateField('projectId', project.id)}
                >
                  {project.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Parent Task */}
        <div className="space-y-2">
          <Label>Parent Task</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                {selectedParentTask?.name || 'No parent task'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => updateField('parentTaskId', undefined)}>
                No parent task
              </DropdownMenuItem>
              {tasks
                .filter(t => t.id !== formData.id) // Don't allow self-reference
                .map((task) => (
                  <DropdownMenuItem
                    key={task.id}
                    onClick={() => updateField('parentTaskId', task.id)}
                  >
                    {task.name}
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isLoading || !formData.name.trim()}>
          {isLoading ? 'Saving...' : mode === 'create' ? 'Create Task' : 'Update Task'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
} 
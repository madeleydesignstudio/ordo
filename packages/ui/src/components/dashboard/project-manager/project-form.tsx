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

// Project form data interface
export interface ProjectFormData {
  id?: string
  name: string
  description?: string
  icon?: string
  cover?: string
  startDate?: string
  dueDate?: string
  status: 'backlog' | 'todo' | 'in_progress' | 'done' | 'on_hold'
  parentProjectId?: string
}

interface ProjectFormProps {
  initialData?: Partial<ProjectFormData>
  projects?: Array<{ id: string; name: string }> // For parent project selection
  onSubmit: (data: ProjectFormData) => void
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

const iconOptions = ['📁', '🚀', '💼', '🎯', '⚡', '🔥', '💡', '🎨', '🛠️', '📊']

export function ProjectForm({
  initialData = {},
  projects = [],
  onSubmit,
  onCancel,
  isLoading = false,
  mode,
}: ProjectFormProps) {
  const [formData, setFormData] = React.useState<ProjectFormData>({
    name: '',
    status: 'backlog',
    icon: '📁',
    ...initialData,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const updateField = (field: keyof ProjectFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const selectedStatus = statusOptions.find(opt => opt.value === formData.status)
  const selectedParentProject = projects.find(p => p.id === formData.parentProjectId)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Project Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Project Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => updateField('name', e.target.value)}
          placeholder="Enter project name"
          required
        />
      </div>

      {/* Project Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="Enter project description"
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      {/* Icon and Cover Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Project Icon */}
        <div className="space-y-2">
          <Label>Icon</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <span className="mr-2 text-lg">{formData.icon}</span>
                Choose Icon
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {iconOptions.map((icon) => (
                <DropdownMenuItem
                  key={icon}
                  onClick={() => updateField('icon', icon)}
                >
                  <span className="mr-2 text-lg">{icon}</span>
                  {icon}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Cover Image URL */}
        <div className="space-y-2">
          <Label htmlFor="cover">Cover Image URL</Label>
          <Input
            id="cover"
            value={formData.cover || ''}
            onChange={(e) => updateField('cover', e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
        </div>
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

      {/* Status and Parent Project Row */}
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

        {/* Parent Project */}
        <div className="space-y-2">
          <Label>Parent Project</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                {selectedParentProject?.name || 'No parent project'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => updateField('parentProjectId', undefined)}>
                No parent project
              </DropdownMenuItem>
              {projects
                .filter(p => p.id !== formData.id) // Don't allow self-reference
                .map((project) => (
                  <DropdownMenuItem
                    key={project.id}
                    onClick={() => updateField('parentProjectId', project.id)}
                  >
                    {project.name}
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isLoading || !formData.name.trim()}>
          {isLoading ? 'Saving...' : mode === 'create' ? 'Create Project' : 'Update Project'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
} 
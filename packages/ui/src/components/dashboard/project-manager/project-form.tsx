"use client"

import React, { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../select'
import { Button } from '../../button'
import { Input } from '../../input'
import { Label } from '../../label'
import { StorageClient } from '@ordo/storage-client'

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
  user: {
    id: string
    name?: string
  }
}

const statusOptions = [
  { value: 'backlog', label: 'Backlog', color: 'text-gray-600' },
  { value: 'todo', label: 'To Do', color: 'text-blue-600' },
  { value: 'in_progress', label: 'In Progress', color: 'text-yellow-600' },
  { value: 'done', label: 'Done', color: 'text-green-600' },
  { value: 'on_hold', label: 'On Hold', color: 'text-red-600' },
] as const


export function ProjectForm({
  initialData = {},
  projects = [],
  onSubmit,
  onCancel,
  isLoading = false,
  mode,
  user,
}: ProjectFormProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    status: 'backlog',
    icon: '📁',
    ...initialData,
  })
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const updateField = (field: keyof ProjectFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
  
    // Reset state
    setUploadProgress(0)
    setUploadError(null)
  
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file')
      return
    }
  
    // Validate file size (limit to 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setUploadError('File size should be less than 5MB')
      return
    }
  
    try {
      setIsUploading(true)
      
      // Generate a unique path
      const timestamp = Date.now()
      const fileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const userId = user?.id || 'anonymous'
      const path = `users/${userId}/projects/${timestamp}-${fileName}`
      
      // Show progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + Math.random() * 10
          return newProgress > 90 ? 90 : newProgress
        })
      }, 300)
      
      // Call your backend API with full URL
      const backendUrl = process.env.NODE_ENV === 'production' 
        ? 'http://localhost:4321' 
        : 'https://storage.dev-0af.workers.dev/' // Replace with your production backend URL
      
      const response = await fetch(`${backendUrl}/api/upload-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          path: path,
        }),
      })
  
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error:', errorText)
        throw new Error(`Failed to get upload URL: ${response.status}`)
      }
  
      const { uploadUrl, imageUrl, authToken } = await response.json()
  
      // Upload file to your storage service with auth token
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
          'Authorization': `Bearer ${authToken}`, // Add auth header
        },
        body: file,
      })
  
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      if (uploadResponse.ok) {
        updateField('cover', imageUrl)
      } else {
        const errorText = await uploadResponse.text()
        console.error('Upload Error:', errorText)
        throw new Error(`Upload failed: ${uploadResponse.status}`)
      }
    } catch (error) {
      console.error('Upload failed:', error)
      setUploadError(error instanceof Error ? error.message : 'Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }

  const selectedStatus = statusOptions.find(opt => opt.value === formData.status)
  const selectedParentProject = projects.find(p => p.id === formData.parentProjectId)

  // Preview the selected cover image
  const coverImagePreview = formData.cover ? (
    <div className="mt-2 relative rounded-md overflow-hidden" style={{ height: '120px' }}>
      <img 
        src={formData.cover} 
        alt="Cover preview" 
        className="w-full h-full object-cover" 
      />
      <button
        type="button"
        onClick={() => updateField('cover', '')}
        className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1"
        aria-label="Remove image"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  ) : null

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
          <Input
            id="icon"
            value={formData.icon}
            onChange={(e) => updateField('icon', e.target.value)}
            placeholder="Enter icon"
          />
        </div>

        {/* Cover Image */}
        <div className="space-y-2">
          <Label htmlFor="cover">Cover Image</Label>
          <Select onValueChange={(value: string) => updateField('cover', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a cover image" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="https://images.unsplash.com/photo-1">Unsplash Image 1</SelectItem>
              <SelectItem value="https://images.unsplash.com/photo-2">Unsplash Image 2</SelectItem>
              <SelectItem value="https://images.unsplash.com/photo-3">Unsplash Image 3</SelectItem>
              <SelectItem value="https://example.com/preset1.jpg">Preset Image 1</SelectItem>
              <SelectItem value="https://example.com/preset2.jpg">Preset Image 2</SelectItem>
            </SelectContent>
          </Select>
          
          {coverImagePreview}
          
          <Input
            type="file"
            onChange={handleFileChange}
            accept="image/*"
            className="mt-2"
            disabled={isUploading}
          />
          
          {isUploading && (
            <div className="mt-2 space-y-2">
              <div className="text-sm text-muted-foreground">
                Uploading image... {Math.round(uploadProgress)}%
              </div>
              <div className="w-full bg-stone-200 rounded-full h-2.5">
                <div 
                  className="bg-stone-600 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {uploadError && (
            <p className="text-red-500 text-sm mt-1">{uploadError}</p>
          )}
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
          <Select onValueChange={(value: string) => updateField('status', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="backlog">Backlog</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Parent Project */}
        <div className="space-y-2">
          <Label>Parent Project</Label>
          <Select onValueChange={(value: string) => updateField('parentProjectId', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select parent project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No parent project</SelectItem>
              {projects
                .filter(p => p.id !== formData.id) // Don't allow self-reference
                .map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isLoading || isUploading || !formData.name.trim()}>
          {isLoading ? 'Saving...' : mode === 'create' ? 'Create Project' : 'Update Project'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
} 
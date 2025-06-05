"use client"

import React from 'react'
import { Button } from '../../button'
import { Settings, Plus } from 'lucide-react'

export interface Project {
  id: string
  name: string
  description?: string | null
  icon?: string | null
  cover?: string | null
  startDate?: Date | null
  dueDate?: Date | null
  status: 'backlog' | 'todo' | 'in_progress' | 'done' | 'on_hold'
  parentProjectId?: string | null
  createdAt: Date
  updatedAt: Date
}

interface ProjectListProps {
  projects: Project[]
  onEdit: (project: Project) => void
  onDelete: (projectId: string) => void
  onCreateProject?: () => void
  onProjectSettings?: (projectId: string) => void
  isLoading?: boolean
}

function formatDate(date: Date | null | undefined): string {
  if (!date) return ''
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(date))
}

export function ProjectList({ 
  projects, 
  onEdit, 
  onCreateProject,
  onProjectSettings,
  isLoading 
}: ProjectListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-200"></div>
            <div className="p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">No projects found</div>
        <img src="https://storage.dev-0af.workers.dev/architect.png" alt="Empty state" className="w-1/4 mx-auto mb-4" />
        <div className="text-gray-400 text-sm mb-4">Create your first project to get started</div>
        {onCreateProject && (
          <Button
            onClick={onCreateProject}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Project
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => {
        return (
          <div 
            key={project.id} 
            className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer"
            onClick={() => onEdit(project)}
          >
            {/* Cover Image */}
            <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
              {project.cover ? (
                <img
                  src={project.cover}
                  alt={`${project.name} cover`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-6xl opacity-20">
                    {project.icon || '📁'}
                  </span>
                </div>
              )}
              
              {/* Settings Icon - Hidden by default, shown on hover */}
              <button
                className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation()
                  onProjectSettings?.(project.id)
                }}
                title="Project Settings"
              >
                <Settings className="h-4 w-4 text-gray-700" />
              </button>
            </div>

            {/* Project Info */}
            <div className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">
                  {project.icon || '📁'}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg text-gray-900 truncate">
                    {project.name}
                  </h3>
                </div>
              </div>
              
              <div className="text-sm text-gray-500">
                Created {formatDate(project.createdAt)}
              </div>
            </div>
          </div>
        )
      })}
      
      {/* Add Project Placeholder Cards */}
      {projects.length < 6 && onCreateProject && (
        Array.from({ length: 6 - projects.length }).map((_, index) => (
          <div 
            key={`placeholder-${index}`}
            className="border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer group"
            onClick={onCreateProject}
          >
            <div className="h-48 flex items-center justify-center">
              <div className="text-center">
                <Plus className="h-12 w-12 text-gray-400 group-hover:text-blue-500 transition-colors mx-auto mb-2" />
                <span className="text-sm text-gray-500 group-hover:text-blue-600 transition-colors">
                  Add Project
                </span>
              </div>
            </div>
            <div className="p-4">
              <div className="h-6"></div> {/* Spacer to match project card height */}
              <div className="h-5"></div> {/* Spacer to match created date */}
            </div>
          </div>
        ))
      )}
    </div>
  )
} 
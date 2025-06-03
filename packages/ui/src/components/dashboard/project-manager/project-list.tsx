"use client"

import React from 'react'
import { Button } from '../../button'
import { MoreHorizontal, Edit, Trash2, Calendar, User } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../dropdown-menu'

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
  isLoading?: boolean
}

const statusConfig = {
  backlog: { label: 'Backlog', color: 'bg-gray-100 text-gray-700', dot: 'bg-gray-500' },
  todo: { label: 'To Do', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  done: { label: 'Done', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  on_hold: { label: 'On Hold', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
}

function formatDate(date: Date | null | undefined): string {
  if (!date) return ''
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(date))
}

export function ProjectList({ projects, onEdit, onDelete, isLoading }: ProjectListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="border rounded-lg p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">No projects found</div>
        <div className="text-gray-400 text-sm">Create your first project to get started</div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => {
        const status = statusConfig[project.status]
        
        return (
          <div key={project.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
            {/* Project Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{project.icon || '📁'}</span>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
                    {project.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`w-2 h-2 rounded-full ${status.dot}`}></span>
                    <span className={`text-xs px-2 py-1 rounded-full ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Actions Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(project)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete(project.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Project Description */}
            {project.description && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {project.description}
              </p>
            )}

            {/* Cover Image */}
            {project.cover && (
              <div className="mb-4">
                <img
                  src={project.cover}
                  alt={`${project.name} cover`}
                  className="w-full h-32 object-cover rounded-md"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
              </div>
            )}

            {/* Project Dates */}
            <div className="space-y-2 text-xs text-gray-500">
              {project.startDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <span>Start: {formatDate(project.startDate)}</span>
                </div>
              )}
              {project.dueDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <span>Due: {formatDate(project.dueDate)}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <User className="h-3 w-3" />
                <span>Created: {formatDate(project.createdAt)}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
} 
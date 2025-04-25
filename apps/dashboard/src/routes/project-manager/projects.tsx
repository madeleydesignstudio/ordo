import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import React, { useState } from 'react'

// Define the type for a project based on schema/API response
// Adjust based on the actual structure returned by your API
type Project = {
  id: string; // Assuming UUID string from schema
  name: string;
  description?: string | null;
  createdAt: string; // Assuming ISO string from DB
  updatedAt: string; // Assuming ISO string from DB
  // tasks?: any[]; // Include if tasks are fetched and needed
}

// Function to fetch projects
const fetchProjects = async (): Promise<{ projects: Project[] }> => {
  const res = await fetch('/api/projects')
  if (!res.ok) {
    throw new Error('Network response was not ok')
  }
  return res.json()
}

// Function to create a project
const createProject = async (newProject: { name: string; description?: string }): Promise<{ project: Project }> => {
  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newProject),
  })
  if (!res.ok) {
    // Attempt to read error message from API response
    const errorData = await res.json().catch(() => ({ error: 'Failed to create project. Check server logs.' }))
    throw new Error(errorData?.error || 'Failed to create project')
  }
  return res.json()
}

const updateProject = async (updatedData: { id: string; name?: string; description?: string | null }): Promise<{ project: Project }> => {
  const res = await fetch('/api/projects', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedData),
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Failed to update project. Check server logs.' }))
    throw new Error(errorData?.error || 'Failed to update project')
  }
  return res.json()
}

const deleteProject = async (projectId: string): Promise<{ message: string; deletedProjectId: string }> => {
  const res = await fetch('/api/projects', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: projectId }), // Send ID in body as per API handler
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Failed to delete project. Check server logs.' }))
    throw new Error(errorData?.error || 'Failed to delete project')
  }
  return res.json()
}

export const Route = createFileRoute('/project-manager/projects')({
  component: RouteComponent,
})

function RouteComponent() {
  const queryClient = useQueryClient()
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  
  // State for inline editing
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')

  // Query for fetching projects
  const { data: projectsData, isLoading, error: projectsError } = useQuery({ 
    queryKey: ['projects'], 
    queryFn: fetchProjects 
  })

  // Common invalidation logic
  const invalidateProjects = () => {
    queryClient.invalidateQueries({ queryKey: ['projects'] })
  }

  // Mutation for creating projects
  const createProjectMutation = useMutation({ 
    mutationFn: createProject, 
    onSuccess: () => {
      invalidateProjects()
      setProjectName('')
      setProjectDescription('')
      setFormError(null)
    },
    onError: (error) => {
       setFormError(`Create Error: ${error.message}`)
    }
  })

  // Mutation for updating projects
  const updateProjectMutation = useMutation({ 
    mutationFn: updateProject, 
    onSuccess: () => {
      invalidateProjects()
      setEditingProjectId(null) // Exit editing mode
    },
    onError: (error) => {
      // Display error specific to the item being edited?
      // For now, setting general form error
      setFormError(`Update Error: ${error.message}`)
    }
  })

  // Mutation for deleting projects
  const deleteProjectMutation = useMutation({ 
    mutationFn: deleteProject, 
    onSuccess: () => {
      invalidateProjects()
    },
    onError: (error) => {
      setFormError(`Delete Error: ${error.message}`)
    }
  })

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    if (!projectName.trim()) {
      setFormError('Project name is required.')
      return
    }
    createProjectMutation.mutate({ name: projectName, description: projectDescription })
  }

  const handleEditClick = (project: Project) => {
    setEditingProjectId(project.id)
    setEditName(project.name)
    setEditDescription(project.description || '')
    setFormError(null) // Clear errors when starting edit
  }

  const handleCancelEdit = () => {
    setEditingProjectId(null)
  }

  const handleSaveEdit = (projectId: string) => {
    if (!editName.trim()) {
      setFormError('Project name cannot be empty.');
      return; 
    }
    updateProjectMutation.mutate({ 
      id: projectId, 
      name: editName, 
      description: editDescription 
    })
  }

  const handleDeleteClick = (projectId: string, projectName: string) => {
    if (window.confirm(`Are you sure you want to delete the project "${projectName}"? This cannot be undone.`)) {
      deleteProjectMutation.mutate(projectId)
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Projects</h1>

      {/* Create Project Form */}
      <form onSubmit={handleCreateProject} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h2>Create New Project</h2>
        {/* Display create/general errors here */}
        {formError && !editingProjectId && <p style={{ color: 'red' }}>Error: {formError}</p>}
        {createProjectMutation.isError && !editingProjectId && <p style={{ color: 'red' }}>Create Error: {createProjectMutation.error.message}</p>}
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="projectName" style={{ marginRight: '10px' }}>Name:</label>
          <input
            id="projectName"
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            required
            style={{ padding: '5px' }}
            disabled={createProjectMutation.isPending}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="projectDescription" style={{ marginRight: '10px' }}>Description:</label>
          <textarea
            id="projectDescription"
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            style={{ padding: '5px', minWidth: '200px' }}
            disabled={createProjectMutation.isPending}
          />
        </div>
        <button type="submit" disabled={createProjectMutation.isPending} style={{ padding: '8px 15px' }}>
          {createProjectMutation.isPending ? 'Creating...' : 'Create Project'}
        </button>
      </form>

      {/* Project List */}
      <h2>Project List</h2>
      {/* Display delete/update errors here? Or maybe below specific item? */} 
      {formError && editingProjectId && <p style={{ color: 'red' }}>Error: {formError}</p>} 
      {deleteProjectMutation.isError && <p style={{ color: 'red' }}>Delete Error: {deleteProjectMutation.error.message}</p>}
      
      {isLoading && <p>Loading projects...</p>}
      {projectsError && <p style={{ color: 'red' }}>Error loading projects: {projectsError.message}</p>}
      {projectsData && projectsData.projects.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {projectsData.projects.map((project) => (
            <li key={project.id} style={{ border: `1px solid ${editingProjectId === project.id ? '#007bff' : '#eee'}`, marginBottom: '10px', padding: '10px', borderRadius: '5px' }}>
              {editingProjectId === project.id ? (
                // -- Editing View --
                <div>
                  <div style={{ marginBottom: '10px' }}>
                    <label htmlFor={`editName-${project.id}`} style={{ marginRight: '10px' }}>Name:</label>
                    <input
                      id={`editName-${project.id}`}
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                      style={{ padding: '5px' }}
                      disabled={updateProjectMutation.isPending}
                    />
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <label htmlFor={`editDesc-${project.id}`} style={{ marginRight: '10px' }}>Description:</label>
                    <textarea
                      id={`editDesc-${project.id}`}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      style={{ padding: '5px', minWidth: '200px' }}
                      disabled={updateProjectMutation.isPending}
                    />
                  </div>
                  {/* Show specific update error for this item */}
                   {updateProjectMutation.isError && editingProjectId === project.id && <p style={{ color: 'red', fontSize: '0.9em' }}>Update Error: {updateProjectMutation.error.message}</p>}
                  <div>
                    <button 
                      onClick={() => handleSaveEdit(project.id)}
                      disabled={updateProjectMutation.isPending || !editName.trim()}
                      style={{ marginRight: '5px', padding: '5px 10px' }}
                    >
                      {updateProjectMutation.isPending ? 'Saving...' : 'Save'}
                    </button>
                    <button 
                      onClick={handleCancelEdit}
                      disabled={updateProjectMutation.isPending}
                      style={{ padding: '5px 10px' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // -- Display View --
                <div>
                  <h3>{project.name}</h3>
                  <p>{project.description || 'No description'}</p>
                  <small>Created: {new Date(project.createdAt).toLocaleString()}</small>
                  <div style={{ marginTop: '10px' }}>
                    <button 
                      style={{ marginRight: '5px' }} 
                      onClick={() => handleEditClick(project)}
                      disabled={deleteProjectMutation.isPending || updateProjectMutation.isPending || editingProjectId !== null} // Disable if any mutation active or another item is being edited
                    >
                      Edit
                    </button>
                    <button 
                      style={{ color: 'red' }} 
                      onClick={() => handleDeleteClick(project.id, project.name)}
                      disabled={deleteProjectMutation.isPending || updateProjectMutation.isPending || editingProjectId !== null} // Disable if any mutation active or another item is being edited
                    >
                      {deleteProjectMutation.isPending && deleteProjectMutation.variables === project.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        !isLoading && !projectsError && <p>No projects found. Create one above!</p>
      )}
    </div>
  )
}

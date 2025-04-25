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

export const Route = createFileRoute('/project-manager/projects')({
  component: RouteComponent,
})

function RouteComponent() {
  const queryClient = useQueryClient()
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  // Query for fetching projects
  const { data: projectsData, isLoading, error: projectsError } = useQuery({ 
    queryKey: ['projects'], 
    queryFn: fetchProjects 
  })

  // Mutation for creating projects
  const createProjectMutation = useMutation({ 
    mutationFn: createProject, 
    onSuccess: () => {
      // Invalidate and refetch projects query after successful creation
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      // Clear form
      setProjectName('')
      setProjectDescription('')
      setFormError(null)
    },
    onError: (error) => {
       setFormError(error.message)
    }
  })

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null) // Clear previous errors
    if (!projectName.trim()) {
      setFormError('Project name is required.')
      return
    }
    createProjectMutation.mutate({ name: projectName, description: projectDescription })
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Projects</h1>

      {/* Create Project Form */}
      <form onSubmit={handleCreateProject} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h2>Create New Project</h2>
        {formError && <p style={{ color: 'red' }}>Error: {formError}</p>}
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="projectName" style={{ marginRight: '10px' }}>Name:</label>
          <input
            id="projectName"
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            required
            style={{ padding: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="projectDescription" style={{ marginRight: '10px' }}>Description:</label>
          <textarea
            id="projectDescription"
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            style={{ padding: '5px', minWidth: '200px' }}
          />
        </div>
        <button type="submit" disabled={createProjectMutation.isPending} style={{ padding: '8px 15px' }}>
          {createProjectMutation.isPending ? 'Creating...' : 'Create Project'}
        </button>
      </form>

      {/* Project List */}
      <h2>Project List</h2>
      {isLoading && <p>Loading projects...</p>}
      {projectsError && <p style={{ color: 'red' }}>Error loading projects: {projectsError.message}</p>}
      {projectsData && projectsData.projects.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {projectsData.projects.map((project) => (
            <li key={project.id} style={{ border: '1px solid #eee', marginBottom: '10px', padding: '10px', borderRadius: '5px' }}>
              <h3>{project.name}</h3>
              <p>{project.description || 'No description'}</p>
              <small>Created: {new Date(project.createdAt).toLocaleString()}</small>
              <div style={{ marginTop: '10px' }}>
                <button style={{ marginRight: '5px' }} onClick={() => alert('Edit functionality not yet implemented.')}>Edit (Not Implemented)</button>
                <button style={{ color: 'red' }} onClick={() => alert('Delete functionality not yet implemented.')}>Delete (Not Implemented)</button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        !isLoading && !projectsError && <p>No projects found. Create one above!</p>
      )}
    </div>
  )
}

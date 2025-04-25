import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'

// Define a type for the task data based on your schema/API response
type Task = {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done';
  dueDate: string | null; // Assuming API returns ISO string
  projectId: string | null;
  createdAt: string; // Assuming API returns ISO string
  updatedAt: string; // Assuming API returns ISO string
};

// Define a type for the project data based on your API response
type Project = {
  id: string;
  name: string;
  // Add other project fields if needed
};

export const Route = createFileRoute('/project-manager/tasks')({
  component: RouteComponent,
})

function RouteComponent() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoadingTasks, setIsLoadingTasks] = useState(false)
  const [isLoadingProjects, setIsLoadingProjects] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [taskName, setTaskName] = useState('')
  const [taskDescription, setTaskDescription] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Fetch tasks function
  const fetchTasks = async () => {
    setIsLoadingTasks(true)
    // Keep previous error if fetching projects failed
    // setError(null)
    try {
      const response = await fetch('/api/tasks')
      if (!response.ok) {
        throw new Error(`HTTP error fetching tasks! status: ${response.status}`)
      }
      const data: Task[] = await response.json()
      setTasks(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch tasks')
      console.error('Fetch tasks error:', e)
    } finally {
      setIsLoadingTasks(false)
    }
  }

  // Fetch projects function
  const fetchProjects = async () => {
    setIsLoadingProjects(true)
    setError(null)
    try {
      const response = await fetch('/api/projects') // Assuming this is your projects endpoint
      if (!response.ok) {
        throw new Error(`HTTP error fetching projects! status: ${response.status}`)
      }
      // Adjust based on the actual structure returned by /api/projects
      const data: { projects: Project[] } = await response.json()
      setProjects(data.projects || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch projects')
      console.error('Fetch projects error:', e)
    } finally {
      setIsLoadingProjects(false)
    }
  }

  // Fetch tasks and projects on component mount
  useEffect(() => {
    fetchTasks()
    fetchProjects()
  }, [])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    // TODO: Add loading state for submission
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: taskName,
          description: taskDescription,
          projectId: selectedProjectId, // Pass the selected project ID (can be null)
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error creating task! status: ${response.status}`)
      }

      // Clear form and refetch tasks
      setTaskName('')
      setTaskDescription('')
      setSelectedProjectId(null) // Reset project selection
      fetchTasks() // Refetch tasks to show the newly created one

    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create task')
      console.error('Create task error:', e)
    }
  }

  return (
    <div>
      <h2>Create New Task</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="taskName">Task Name:</label>
          <input
            id="taskName"
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="taskDescription">Description:</label>
          <textarea
            id="taskDescription"
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
          />
        </div>
        <div>
            <label htmlFor="projectSelect">Assign to Project:</label>
            <select
              id="projectSelect"
              value={selectedProjectId ?? ''} // Use empty string for 'No Project' option value
              onChange={(e) => setSelectedProjectId(e.target.value || null)} // Set to null if empty string selected
              disabled={isLoadingProjects}
            >
              <option value="">-- No Project --</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            {isLoadingProjects && <span> Loading projects...</span>}
        </div>
        <button type="submit">Create Task</button>
      </form>

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      <hr style={{ margin: '20px 0' }}/>

      <h2>Existing Tasks</h2>
      {isLoadingTasks && <p>Loading tasks...</p>}
      {!isLoadingTasks && !error && tasks.length === 0 && <p>No tasks found.</p>}
      {!isLoadingTasks && !error && tasks.length > 0 && (
        <ul>
          {tasks.map((task) => (
            <li key={task.id}>
              <strong>{task.title}</strong> ({task.status})
              {/* Optionally display project name if available */}
              {task.projectId && (
                <span> (Project: {projects.find(p => p.id === task.projectId)?.name ?? 'Loading...'})</span>
              )}
              {task.description && <p>{task.description}</p>}
              {/* TODO: Add edit/delete buttons here */}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

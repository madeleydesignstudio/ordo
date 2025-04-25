import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
// Import the enum values if they are exported from schema, otherwise define them here
import { taskStatusEnum } from '~/lib/server/schema/tasks.schema'; // Adjust path if needed

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

// Helper to format Date to YYYY-MM-DD for input type=date
const formatDateForInput = (date: Date | null): string => {
  if (!date) return '';
  return date.toISOString().split('T')[0];
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
  const [isSubmitting, setIsSubmitting] = useState(false); // Add submitting state

  // Form State
  const [taskName, setTaskName] = useState('')
  const [taskDescription, setTaskDescription] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<'todo' | 'in_progress' | 'done'>('todo');
  const [taskDueDate, setTaskDueDate] = useState(''); // Store as YYYY-MM-DD string

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
      setTasks([]); // Clear tasks on error
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
      setProjects([]); // Clear projects on error
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
    setIsSubmitting(true);

    // Format dueDate: null if empty, otherwise add time for proper ISO string conversion if needed by backend
    const dueDateToSend = taskDueDate ? new Date(taskDueDate).toISOString() : null;

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: taskName,
          description: taskDescription,
          projectId: selectedProjectId, 
          status: taskStatus,
          dueDate: dueDateToSend, 
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error creating task! status: ${response.status}`)
      }

      // Clear form and refetch tasks
      setTaskName('')
      setTaskDescription('')
      setSelectedProjectId(null)
      setTaskStatus('todo')
      setTaskDueDate('')
      fetchTasks() // Refetch tasks to show the newly created one

    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create task')
      console.error('Create task error:', e)
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <h2>Create New Task</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label htmlFor="taskName" style={{ display: 'block', marginBottom: '5px' }}>Task Name:</label>
          <input
            id="taskName"
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            required
            disabled={isSubmitting}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div>
          <label htmlFor="taskDescription" style={{ display: 'block', marginBottom: '5px' }}>Description:</label>
          <textarea
            id="taskDescription"
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            disabled={isSubmitting}
            style={{ width: '100%', padding: '8px', minHeight: '80px' }}
          />
        </div>
         <div>
            <label htmlFor="taskStatus" style={{ display: 'block', marginBottom: '5px' }}>Status:</label>
            <select
              id="taskStatus"
              value={taskStatus}
              // Type assertion needed because TS doesn't know the event target value is one of the enum values
              onChange={(e) => setTaskStatus(e.target.value as typeof taskStatus)}
              disabled={isSubmitting}
              style={{ width: '100%', padding: '8px' }}
            >
              {/* Use taskStatusEnum if imported, otherwise hardcode */} 
              {(taskStatusEnum?.enumValues || ['todo', 'in_progress', 'done']).map((statusValue) => (
                <option key={statusValue} value={statusValue}>
                  {statusValue.replace('_', ' ')} {/* Nicer display */}
                </option>
              ))}
            </select>
        </div>
        <div>
            <label htmlFor="taskDueDate" style={{ display: 'block', marginBottom: '5px' }}>Due Date:</label>
            <input
              id="taskDueDate"
              type="date"
              value={taskDueDate}
              onChange={(e) => setTaskDueDate(e.target.value)}
              disabled={isSubmitting}
              style={{ width: '100%', padding: '8px' }}
            />
        </div>
        <div>
            <label htmlFor="projectSelect" style={{ display: 'block', marginBottom: '5px' }}>Assign to Project:</label>
            <select
              id="projectSelect"
              value={selectedProjectId ?? ''} 
              onChange={(e) => setSelectedProjectId(e.target.value || null)}
              disabled={isLoadingProjects || isSubmitting}
              style={{ width: '100%', padding: '8px' }}
            >
              <option value="">-- No Project --</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            {isLoadingProjects && <span style={{ fontSize: '0.8em', color: '#888' }}> Loading projects...</span>}
        </div>
        <button 
           type="submit" 
           disabled={isSubmitting}
           style={{ padding: '10px 15px', cursor: isSubmitting ? 'wait' : 'pointer' }}
        >
          {isSubmitting ? 'Creating...' : 'Create Task'}
        </button>
      </form>

      {error && <p style={{ color: 'red', marginTop: '15px' }}>Error: {error}</p>}

      <hr style={{ margin: '30px 0' }}/>

      <h2>Existing Tasks</h2>
      {isLoadingTasks && <p>Loading tasks...</p>}
      {!isLoadingTasks && !error && tasks.length === 0 && <p>No tasks found.</p>}
      {!isLoadingTasks && !error && tasks.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {tasks.map((task) => (
            <li key={task.id} style={{ border: '1px solid #eee', padding: '10px', borderRadius: '5px' }}>
              <strong>{task.title}</strong> ({task.status.replace('_', ' ')})
              {task.projectId && (
                <span style={{ fontSize: '0.9em', color: '#555' }}> (Project: {projects.find(p => p.id === task.projectId)?.name ?? '...'})</span>
              )}
              {task.dueDate && (
                 <span style={{ fontSize: '0.9em', color: '#555', marginLeft: '10px' }}> Due: {formatDateForInput(new Date(task.dueDate))}</span>
              )}
              {task.description && <p style={{ marginTop: '5px', color: '#333' }}>{task.description}</p>}
              {/* TODO: Add edit/delete buttons here */}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

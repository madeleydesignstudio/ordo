import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/project-manager/tasks')({
  component: RouteComponent,
})

function RouteComponent() {
  const [taskName, setTaskName] = useState('')
  const [taskDescription, setTaskDescription] = useState('')
  // TODO: Add project selection or get project ID from context/params

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    // TODO: Implement task creation logic (e.g., API call)
    console.log('Creating task:', { name: taskName, description: taskDescription })
    setTaskName('')
    setTaskDescription('')
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
        {/* TODO: Add project selector here */}
        <button type="submit">Create Task</button>
      </form>
      {/* TODO: Display existing tasks */}
    </div>
  )
}

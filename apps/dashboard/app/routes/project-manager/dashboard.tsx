import { createFileRoute } from '@tanstack/react-router'
import DateSlider from '@workspace/ui/components/dashboard/project-manager/date-slider'
import { useState } from 'react'
import { trpc } from '../../lib/trpc'
import { CalendarIcon } from 'lucide-react'

export const Route = createFileRoute('/project-manager/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const { data: tasks, isLoading, error } = trpc.tasks.list.useQuery()

  const handleDateChange = (newDate: Date) => {
    setCurrentDate(newDate)
  }

  const handleTodayClick = () => {
    setCurrentDate(new Date())
  }

  return (
    <div className="flex flex-col h-[93vh] w-[97.1vw]">
      {/* Task content area */}
      <div className="flex-1 min-h-0 overflow-auto">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-stone-800">Tasks for {currentDate.toLocaleDateString()}</h2>
            <button 
              onClick={handleTodayClick}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-stone-600 bg-white border border-stone-200 rounded-md shadow-sm hover:bg-stone-50 transition-colors"
            >
              <CalendarIcon className="h-4 w-4" />
              <span>Today</span>
            </button>
          </div>
          
          {isLoading && <p className="text-sm text-stone-500">Loading tasks...</p>}
          {error && <p className="text-sm text-red-500">Error loading tasks: {error.message}</p>}
          <div className="space-y-2">
            {/* Filter tasks for current date */}
            {tasks?.filter(task => {
              const dueDate = task.dueDate ? new Date(task.dueDate) : null
              if (!dueDate) return false
              
              const taskDate = new Date(dueDate)
              return (
                taskDate.getDate() === currentDate.getDate() &&
                taskDate.getMonth() === currentDate.getMonth() &&
                taskDate.getFullYear() === currentDate.getFullYear()
              )
            }).map(task => (
              <div 
                key={task.id} 
                className="p-3 bg-white rounded-md border border-stone-200 shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-stone-800">{task.name}</h3>
                  <span 
                    className={`text-xs px-2 py-1 rounded-full ${
                      task.status === 'todo' ? 'bg-blue-100 text-blue-800' :
                      task.status === 'in_progress' ? 'bg-orange-100 text-orange-800' :
                      task.status === 'done' ? 'bg-green-100 text-green-800' :
                      task.status === 'backlog' ? 'bg-stone-100 text-stone-800' :
                      'bg-red-100 text-red-800'
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
                {task.description && <p className="mt-1 text-sm text-stone-500">{task.description}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* DateSlider at the bottom */}
      <div className="h-[175px] w-full flex-shrink-0">
        <DateSlider currentDate={currentDate} onDateChange={handleDateChange} tasks={tasks || []} />
      </div>
    </div>
  )
}

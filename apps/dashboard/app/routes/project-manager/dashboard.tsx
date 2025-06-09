import { createFileRoute } from '@tanstack/react-router'
import DateSlider from '@workspace/ui/components/dashboard/project-manager/date-slider'
import { useState } from 'react'
import { trpc } from '../../lib/trpc'
import { CalendarIcon, Briefcase, CheckCircle, Flag } from 'lucide-react'
import { useFocusMode } from '@workspace/ui/components/dashboard/main/bottomnav'
import { cn } from '@workspace/ui/lib/utils'
import { useUser } from '../../routes/__root'

export const Route = createFileRoute('/project-manager/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const { data: tasks, isLoading, error } = trpc.tasks.list.useQuery()
  const { data: projects, isLoading: projectsLoading } = trpc.projects.list.useQuery()
  const { isFocusMode } = useFocusMode()
  const user = useUser()

  const handleDateChange = (newDate: Date) => {
    setCurrentDate(newDate)
  }

  const handleTodayClick = () => {
    setCurrentDate(new Date())
  }

  // Format the date for display
  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    }
    return date.toLocaleDateString('en-US', options)
  }

  // Count active projects (non-done status)
  const activeProjects = projects?.filter(project => project.status !== 'done')?.length || 0

  // Count tasks that need to be completed today
  const todayTasks = tasks?.filter(task => {
    const dueDate = task.dueDate ? new Date(task.dueDate) : null
    if (!dueDate) return false
    
    const taskDate = new Date(dueDate)
    const today = new Date()
    
    return (
      taskDate.getDate() === today.getDate() &&
      taskDate.getMonth() === today.getMonth() &&
      taskDate.getFullYear() === today.getFullYear() &&
      task.status !== 'done'
    )
  })?.length || 0

  // Find the next milestone (task with the closest future due date that's not completed)
  const nextMilestone = tasks?.filter(task => {
    const dueDate = task.dueDate ? new Date(task.dueDate) : null
    if (!dueDate) return false
    
    const taskDate = new Date(dueDate)
    const today = new Date()
    
    return taskDate >= today && task.status !== 'done'
  })
  .sort((a, b) => {
    const dateA = a.dueDate ? new Date(a.dueDate) : new Date()
    const dateB = b.dueDate ? new Date(b.dueDate) : new Date()
    return dateA.getTime() - dateB.getTime()
  })[0]

  return (
    <div className={cn(
      "transition-all duration-300 ease-in-out flex flex-col",
      isFocusMode 
        ? "h-[97vh] w-[99.5vw]" 
        : "h-[93vh] w-[97.1vw]"
    )}>
      {/* Task content area */}
      <div className="min-h-0">
        <div className="p-4">
          <div className="flex justify-end items-center mb-4">
            <button 
              onClick={handleTodayClick}
              className="flex items-center space-x-2 text-xs text-stone-300 border border-stone-300 rounded-md p-1 hover:bg-stone-200 transition-colors"
            >
              <CalendarIcon className="h-4 w-4 text-stone-600" />
              <span className="text-xs text-stone-600">Today</span>
            </button>
          </div>
         
        </div>
       
      </div>
      <div className='h-full w-3xl mx-auto flex flex-col items-start justify-center gap-4'>
        <div className='flex flex-col gap-2 justify-start text-left font-bold text-xl text-stone-400'>
          <h1>Hello {user?.name || 'User'}</h1>
          <h2>Today is {formatDate(currentDate)}</h2>
        </div>
        <div className='bg-stone-200/50 w-full h-1/4 rounded-md border border-stone-400'></div>
        <div className='flex flex-row w-full gap-4 h-1/4'>
          <div className='bg-stone-200/50 w-1/3 rounded-md border border-stone-400 p-3 flex items-center'>
            <div className="bg-blue-100 p-2 rounded-full mr-2">
              <Briefcase className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-stone-800">Active Projects</h3>
              <p className="text-xl font-bold">{activeProjects}</p>
              {projectsLoading && <p className="text-xs text-stone-500">Loading...</p>}
            </div>
          </div>
          <div className='bg-stone-200 w-1/3 rounded-md border border-stone-400 p-3 flex items-center'>
            <div className="bg-amber-100 p-2 rounded-full mr-2">
              <CheckCircle className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <h3 className="font-medium text-stone-800">Today's Tasks</h3>
              <p className="text-xl font-bold">{todayTasks}</p>
              {isLoading && <p className="text-xs text-stone-500">Loading...</p>}
            </div>
          </div>
          <div className='bg-stone-200 w-1/3 rounded-md border border-stone-400 p-3 flex items-center'>
            <div className="bg-green-100 p-2 rounded-full mr-2">
              <Flag className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-stone-800">Next Milestone</h3>
              {nextMilestone ? (
                <p className="text-sm font-bold truncate">{nextMilestone.name}</p>
              ) : (
                <p className="text-sm font-medium">No upcoming milestones</p>
              )}
            </div>
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

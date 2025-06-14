import { Link, useLocation } from '@tanstack/react-router'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@workspace/ui/components/breadcrumb'
import type { ProjectFormData } from '@workspace/ui/components/dashboard/project-manager/project-form'
import { ProjectForm } from '@workspace/ui/components/dashboard/project-manager/project-form'
import type { TaskFormData } from '@workspace/ui/components/dashboard/project-manager/task-form'
import { TaskForm } from '@workspace/ui/components/dashboard/project-manager/task-form'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@workspace/ui/components/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { cn } from '@workspace/ui/lib/utils'
import {
  BarChart3,
  Calendar,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  GanttChart,
  Home,
  LayoutGrid,
  List,
  MoreVertical,
  Plus,
  StickyNote,
  Table
} from 'lucide-react'
import React from 'react'
import { ViewType } from '../project-manager/view-container'
import { CommandMenu } from "./command-menu"

// Type definitions
type NavItem = {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }> | string
}

type SecondaryNavConfig = {
  [key: string]: NavItem[]
}

type RouteMap = {
  [key: string]: string
}

type TopNavProps = {
  // tRPC data and mutations
  projects?: { id: string; name: string }[]
  tasks?: { id: string; name: string }[]
  createProject?: (data: any) => Promise<void>
  createTask?: (data: any) => Promise<void>
  isCreatingProject?: boolean
  isCreatingTask?: boolean
  refetchProjects?: () => void
  refetchTasks?: () => void
  user?: any
  onViewChange?: (viewType: ViewType) => void
}

// View option interface
interface ViewOption {
  type: ViewType
  label: string
  icon: React.ComponentType<{ className?: string }>
}

// View options for the selector
const viewOptions: ViewOption[] = [
  { type: 'kanban', label: 'Kanban', icon: LayoutGrid },
  { type: 'list', label: 'List', icon: List },
  { type: 'table', label: 'Table', icon: Table },
  { type: 'calendar', label: 'Calendar', icon: Calendar },
  { type: 'gantt', label: 'Gantt', icon: GanttChart },
]

// Routes where the view selector should be displayed
const viewSelectorRoutes = [
  '/project-manager/projects',
  '/project-manager/tasks',
  '/project-manager/notes',
  '/health-manager/workouts',
  '/health-manager/nutrition',
]

const TopNav = ({ 
  projects = [], 
  tasks = [], 
  createProject, 
  createTask, 
  isCreatingProject = false, 
  isCreatingTask = false,
  refetchProjects,
  refetchTasks,
  user,
  onViewChange
}: TopNavProps = {}) => {
  const location = useLocation()
  const topNavRef = React.useRef<HTMLDivElement>(null)
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = React.useState(false)
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = React.useState(false)
  const [activeView, setActiveView] = React.useState<ViewType>('kanban')

  // Listen for the viewchange event from the project-manager layout
  React.useEffect(() => {
    const topNavEl = topNavRef.current
    
    if (topNavEl) {
      const handleViewChangeEvent = (event: CustomEvent) => {
        if (event.detail.enableViewSelector) {
          setActiveView(event.detail.activeView)
          // Store the callback from the event
          const originalOnViewChange = onViewChange
          // @ts-ignore - we know this exists based on the event creation
          onViewChange = event.detail.onViewChange
          return () => {
            onViewChange = originalOnViewChange
          }
        }
      }
      
      // @ts-ignore - CustomEvent type mismatch
      topNavEl.addEventListener('viewchange', handleViewChangeEvent)
      
      return () => {
        // @ts-ignore - CustomEvent type mismatch
        topNavEl.removeEventListener('viewchange', handleViewChangeEvent)
      }
    }
  }, [])
  
  // Secondary navigation configurations for different routes
  const secondaryNavConfigs: SecondaryNavConfig = {
    '/project-manager': [
      { label: 'Dashboard', href: '/project-manager/dashboard', icon: "https://storage.dev-0af.workers.dev/dashboard.png" },
      { label: 'Projects', href: '/project-manager/projects', icon: "https://storage.dev-0af.workers.dev/project.png" },
      { label: 'Tasks', href: '/project-manager/tasks', icon: "https://storage.dev-0af.workers.dev/task.png" },
      { label: 'Notes', href: '/project-manager/notes', icon: "https://storage.dev-0af.workers.dev/note.png" },
      { label: 'Canvas', href: '/project-manager/canvas', icon: "https://storage.dev-0af.workers.dev/canvas.png" },
      { label: 'Analytics', href: '/project-manager/analytics', icon: "https://storage.dev-0af.workers.dev/analytics.png" },
    ],
    '/content-manager': [
      { label: 'Dashboard', href: '/content-manager/dashboard', icon: "https://storage.dev-0af.workers.dev/dashboard.png" },
      { label: 'People', href: '/content-manager/people', icon: "https://storage.dev-0af.workers.dev/people.png" },
      { label: 'Company', href: '/content-manager/company', icon: "https://storage.dev-0af.workers.dev/company.png" },
      { label: 'Inbox', href: '/content-manager/inbox', icon: "https://storage.dev-0af.workers.dev/inbox.png" },
      { label: 'Email', href: '/content-manager/email', icon: BarChart3 },
      { label: 'Inbox-Zero', href: '/content-manager/inbox-zero', icon: BarChart3 },
      { label: 'Reports', href: '/content-manager/reports', icon: BarChart3 },
    ],
    '/finance-manager': [
      { label: 'Dashboard', href: '/finance-manager/dashboard', icon: Home },
      { label: 'Transactions', href: '/finance-manager/transactions', icon: FolderKanban },
      { label: 'News', href: '/finance-manager/news', icon: CheckSquare },
      { label: 'Portfolio', href: '/finance-manager/portfolio', icon: BarChart3 },
      { label: 'Budgeting', href: '/finance-manager/budgeting', icon: StickyNote },
      { label: 'Reports', href: '/finance-manager/reports', icon: StickyNote },
    ],
    '/health-manager': [
      { label: 'Supplement Tracker', href: '/health-manager/dashboard', icon: "https://storage.dev-0af.workers.dev/dashboard.png" },
      { label: 'Fitness Tracker', href: '/health-manager/workouts', icon: "https://storage.dev-0af.workers.dev/workout.png" },
      { label: 'Sleep', href: '/health-manager/sleep', icon: "https://storage.dev-0af.workers.dev/sleep.png" },
      { label: 'Mood', href: '/health-manager/mood', icon: "https://storage.dev-0af.workers.dev/mood.png" },
      { label: 'Metrics', href: '/health-manager/metrics', icon: "https://storage.dev-0af.workers.dev/metrics.png" },
    ],
  }

  // Check if current route should show the view selector
  const shouldShowViewSelector = viewSelectorRoutes.includes(location.pathname)

  // Handler for changing the view
  const handleViewChange = (viewType: ViewType) => {
    // Set local state first
    setActiveView(viewType)
    
    // Call the onViewChange callback if provided by the parent
    if (onViewChange) {
      onViewChange(viewType)
    }
    
    // If no callback provided, store in localStorage directly as fallback
    if (!onViewChange) {
      localStorage.setItem('projectManagerView', viewType)
    }
    
    // Force a re-render of components that depend on the view type
    window.dispatchEvent(new CustomEvent('viewTypeChanged', { 
      detail: { viewType } 
    }))
  }

  // Restore saved view preference on mount
  React.useEffect(() => {
    if (shouldShowViewSelector && !onViewChange) {
      const savedView = localStorage.getItem('projectManagerView') as ViewType | null
      if (savedView && ['kanban', 'list', 'table', 'calendar', 'gantt', 'classic'].includes(savedView)) {
        setActiveView(savedView as ViewType)
      }
    }
  }, [shouldShowViewSelector, onViewChange])

  // Get current route base (e.g., '/project-manager' from '/project-manager/dashboard')
  const routeBase = '/' + location.pathname.split('/')[1]
  const currentSecondaryNav = secondaryNavConfigs[routeBase] || []

  // Generate breadcrumb items from current path
  const generateBreadcrumbItems = (pathname: string) => {
    const segments = pathname.split('/').filter(Boolean)
    if (segments.length === 0) return [{ label: 'Home', href: '/' }]
    
    const routeMap: RouteMap = {
      'project-manager': 'Project Manager',
      'content-manager': 'Content Manager', 
      'finance-manager': 'Finance Manager',
      'health-manager': 'Health Manager',
      'dashboard': 'Dashboard',
      'projects': 'Projects',
      'tasks': 'Tasks',
      'notes': 'Notes',
      'canvas': 'Canvas',
      'analytics': 'Analytics',
      'content': 'Content',
      'media': 'Media',
      'schedule': 'Schedule',
      'transactions': 'Transactions',
      'budgets': 'Budgets',
      'reports': 'Reports',
      'invoices': 'Invoices',
      'workouts': 'Workouts',
      'nutrition': 'Nutrition',
      'sleep': 'Sleep',
      'mood': 'Mood',
      'metrics': 'Health Metrics',
    }

    return segments.map((segment, index) => {
      const href = '/' + segments.slice(0, index + 1).join('/')
      const label = routeMap[segment] || segment
      return { label, href }
    })
  }

  const handleBack = () => {
    window.history.back()
  }

  const handleForward = () => {
    window.history.forward()
  }

  // Handle creation actions
  const handleCreateProject = () => {
    setIsCreateProjectModalOpen(true)
  }

  const handleCreateTask = () => {
    setIsCreateTaskModalOpen(true)
  }

  const handleCreateNote = () => {
    // TODO: Implement note creation logic
    console.log('Create new note')
  }

  const handleCreateCanvas = () => {
    // TODO: Implement canvas creation logic
    console.log('Create new canvas')
  }

  // Handle form submissions
  const handleProjectSubmit = async (data: ProjectFormData) => {
    if (!createProject) return
    
    try {
      await createProject({
        name: data.name,
        description: data.description,
        icon: data.icon,
        cover: data.cover,
        startDate: data.startDate,
        dueDate: data.dueDate,
        status: data.status,
        parentProjectId: data.parentProjectId,
      })
      setIsCreateProjectModalOpen(false)
      refetchProjects?.()
    } catch (error) {
      console.error('Failed to create project:', error)
    }
  }

  const handleTaskSubmit = async (data: TaskFormData) => {
    if (!createTask) return
    
    try {
      await createTask({
        name: data.name,
        description: data.description,
        startDate: data.startDate,
        dueDate: data.dueDate,
        status: data.status,
        priority: data.priority,
        labels: data.labels,
        projectId: data.projectId,
        parentTaskId: data.parentTaskId,
      })
      setIsCreateTaskModalOpen(false)
      refetchTasks?.()
    } catch (error) {
      console.error('Failed to create task:', error)
    }
  }

  // Update the navigationLinks to include settings and actions
  const navigationLinks = [
    // Project Manager Routes
    {
      title: "Project Manager Dashboard",
      href: "/project-manager/dashboard",
      description: "Go to project manager overview"
    },
    {
      title: "Projects",
      href: "/project-manager/projects",
      description: "View all projects"
    },
    {
      title: "Tasks",
      href: "/project-manager/tasks",
      description: "View all tasks"
    },
    {
      title: "Notes",
      href: "/project-manager/notes",
      description: "View all notes"
    },
    {
      title: "Canvas",
      href: "/project-manager/canvas",
      description: "View all canvases"
    },
    {
      title: "Project Analytics",
      href: "/project-manager/analytics",
      description: "View project analytics"
    },
    // Content Manager Routes
    {
      title: "Content Manager Dashboard",
      href: "/content-manager/dashboard",
      description: "Go to content manager overview"
    },
    {
      title: "Content",
      href: "/content-manager/content",
      description: "Manage content"
    },
    {
      title: "Media",
      href: "/content-manager/media",
      description: "Manage media"
    },
    {
      title: "Schedule",
      href: "/content-manager/schedule",
      description: "Manage schedule"
    },
    {
      title: "Content Analytics",
      href: "/content-manager/analytics",
      description: "View content analytics"
    },
    // Finance Manager Routes
    {
      title: "Finance Manager Dashboard",
      href: "/finance-manager/dashboard",
      description: "Go to finance manager overview"
    },
    {
      title: "Transactions",
      href: "/finance-manager/transactions",
      description: "View all transactions"
    },
    {
      title: "Budgets",
      href: "/finance-manager/budgets",
      description: "Manage budgets"
    },
    {
      title: "Finance Reports",
      href: "/finance-manager/reports",
      description: "View finance reports"
    },
    {
      title: "Invoices",
      href: "/finance-manager/invoices",
      description: "Manage invoices"
    },
    // Health Manager Routes
    {
      title: "Health Manager Dashboard",
      href: "/health-manager/dashboard",
      description: "Go to health manager overview"
    },
    {
      title: "Workouts",
      href: "/health-manager/workouts",
      description: "View and manage workout plans"
    },
    {
      title: "Nutrition",
      href: "/health-manager/nutrition",
      description: "Track diet and nutrition information"
    },
    {
      title: "Sleep",
      href: "/health-manager/sleep",
      description: "Monitor sleep patterns and quality"
    },
    {
      title: "Mood",
      href: "/health-manager/mood",
      description: "Track mood and mental health"
    },
    {
      title: "Health Metrics",
      href: "/health-manager/metrics",
      description: "View health metrics and statistics"
    },
    // General/Settings/Actions
    {
      title: "Settings",
      href: "/settings",
      description: "Account and app settings"
    },
    {
      title: "Create Project",
      action: () => setIsCreateProjectModalOpen(true),
      description: "Open the create project dialog"
    },
    {
      title: "Create Task",
      action: () => setIsCreateTaskModalOpen(true),
      description: "Open the create task dialog"
    }
  ]

  return (
    <div ref={topNavRef} className="topnav-container h-full flex items-center justify-between px-4">
      {/* Left Side - Navigation Controls & Breadcrumb */}
      <div className="flex items-center gap-1 flex-1">
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className='bg-stone-600 hover:bg-stone-700 rounded-full p-2 transition-colors'>
                <Plus className="h-4 w-4 text-stone-50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>Create New</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleCreateProject}>
                <img src="https://storage.dev-0af.workers.dev/project.png" alt="Project" className="h-4 w-4" />
                <span>Project</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCreateTask}>
                <img src="https://storage.dev-0af.workers.dev/task.png" alt="Task" className="h-4 w-4" />
                <span>Task</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCreateNote}>
                <img src="https://storage.dev-0af.workers.dev/note.png" alt="Note" className="h-4 w-4" />
                <span>Note</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCreateCanvas}>
                <img src="https://storage.dev-0af.workers.dev/canvas.png" alt="Canvas" className="h-4 w-4" />
                <span>Canvas</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <button onClick={handleBack}>
            <ChevronLeft className="h-4 w-4 text-stone-300" />
          </button>
          <button onClick={handleForward}>
            <ChevronRight className="h-4 w-4 text-stone-300" />
          </button>
        </div>
        <Breadcrumb className="text-xs">
          <BreadcrumbList>
            {generateBreadcrumbItems(location.pathname).map((item, index, array) => (
              <React.Fragment key={item.href}>
                <BreadcrumbItem>
                  {index === array.length - 1 ? (
                    <BreadcrumbPage className="text-stone-300 text-xs">
                      {item.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link to={item.href} className="text-stone-300 hover:text-stone-100 text-xs">
                        {item.label}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {index < array.length - 1 && <BreadcrumbSeparator><span className="text-stone-300 text-xs">/</span></BreadcrumbSeparator>}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Middle - Secondary Navigation Links */}
      {currentSecondaryNav.length > 0 && (
        <div className="flex-1 flex items-center gap-6 bg-stone-100 border border-stone-300 rounded-md justify-between px-4">
          {currentSecondaryNav.map((item: NavItem, index: number) => {
           
            const Icon = item.icon
            const isActive = location.pathname === item.href
            
            return (
              <Link key={index} to={item.href}>
                <button
                  className="flex items-center gap-1 "
                >
                  {typeof Icon === 'string' ? (
                    <img src={Icon} alt={item.label} className="h-8 w-8" />
                  ) : (
                    <Icon className="h-3 w-3" />
                  )}
                  <span className={`text-[8px] ${isActive ? 'underline font-bold' : ''}`}>
                    {item.label}
                  </span>
                </button>
              </Link>
            )
          })}
        </div>
      )}

      {/* Right Side - Logo, Search, Settings */}
      <div className="flex items-center gap-1 flex-1 justify-end">

        {/* View Selector */}
        {shouldShowViewSelector && (
          <div className="flex items-center bg-stone-100 border border-stone-200 rounded-md mr-2">
            {viewOptions.map((option) => {
              const Icon = option.icon
              return (
                <button
                  key={option.type}
                  onClick={() => handleViewChange(option.type)}
                  className={cn(
                    "p-1 flex items-center justify-center transition-colors",
                    activeView === option.type 
                      ? "bg-stone-200 text-stone-800" 
                      : "text-stone-600 hover:text-stone-800 hover:bg-stone-200"
                  )}
                  title={option.label}
                >
                  <Icon className="h-4 w-4" />
                </button>
              )
            })}
          </div>
        )}

        <CommandMenu links={navigationLinks} />
        <button>
          <MoreVertical className="h-4 w-4 text-stone-400" />
        </button>

        <div className="flex items-center gap-1">
          <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xs">O</span>
          </div>
          <span className="text-sm font-semibold">Ordo</span>
        </div>
      </div>

      {/* Create Project Dialog */}
      <Dialog open={isCreateProjectModalOpen} onOpenChange={setIsCreateProjectModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <ProjectForm
            mode="create"
            user={user}
            onSubmit={handleProjectSubmit}
            onCancel={() => setIsCreateProjectModalOpen(false)}
            projects={projects}
            isLoading={isCreatingProject}
          />
        </DialogContent>
      </Dialog>

      {/* Create Task Dialog */}
      <Dialog open={isCreateTaskModalOpen} onOpenChange={setIsCreateTaskModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <TaskForm
            mode="create"
            onSubmit={handleTaskSubmit}
            onCancel={() => setIsCreateTaskModalOpen(false)}
            projects={projects}
            tasks={tasks}
            isLoading={isCreatingTask}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default TopNav

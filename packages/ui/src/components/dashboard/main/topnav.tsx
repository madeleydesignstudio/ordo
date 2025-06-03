import React from 'react'
import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  MoreHorizontal,
  Home,
  FolderKanban,
  CheckSquare,
  StickyNote,
  Palette,
  BarChart3,
  MoreVertical,
  FileText,
  Briefcase
} from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'

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

const TopNav = () => {
  const location = useLocation()
  const navigate = useNavigate()

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
      { label: 'Dashboard', href: '/content-manager/dashboard', icon: Home },
      { label: 'Content', href: '/content-manager/content', icon: FolderKanban },
      { label: 'Media', href: '/content-manager/media', icon: Palette },
      { label: 'Schedule', href: '/content-manager/schedule', icon: CheckSquare },
      { label: 'Analytics', href: '/content-manager/analytics', icon: BarChart3 },
    ],
    '/finance-manager': [
      { label: 'Dashboard', href: '/finance-manager/dashboard', icon: Home },
      { label: 'Transactions', href: '/finance-manager/transactions', icon: FolderKanban },
      { label: 'Budgets', href: '/finance-manager/budgets', icon: CheckSquare },
      { label: 'Reports', href: '/finance-manager/reports', icon: BarChart3 },
      { label: 'Invoices', href: '/finance-manager/invoices', icon: StickyNote },
    ],
  }

  // Get current route base (e.g., '/project-manager' from '/project-manager/dashboard')
  const routeBase = '/' + location.pathname.split('/')[1]
  const currentSecondaryNav = secondaryNavConfigs[routeBase] || []

  // Generate breadcrumb from current path
  const generateBreadcrumb = (pathname: string) => {
    const segments = pathname.split('/').filter(Boolean)
    if (segments.length === 0) return 'Home'
    
    const routeMap: RouteMap = {
      'project-manager': 'Project Manager',
      'content-manager': 'Content Manager', 
      'finance-manager': 'Finance Manager',
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
    }

    return segments.map(segment => routeMap[segment] || segment).join(' / ')
  }

  const handleBack = () => {
    window.history.back()
  }

  const handleForward = () => {
    window.history.forward()
  }

  // Handle creation actions
  const handleCreateProject = () => {
    // TODO: Implement project creation logic
    console.log('Create new project')
  }

  const handleCreateTask = () => {
    // TODO: Implement task creation logic
    console.log('Create new task')
  }

  const handleCreateNote = () => {
    // TODO: Implement note creation logic
    console.log('Create new note')
  }

  const handleCreateCanvas = () => {
    // TODO: Implement canvas creation logic
    console.log('Create new canvas')
  }

  return (
    <div className="h-full flex items-center justify-between px-4">
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
        <div className="text-xs text-stone-300">
          {generateBreadcrumb(location.pathname)}
        </div>
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
        <button >
          <Search className="h-4 w-4 text-stone-400" />
        </button>
        
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
    </div>
  )
}

export default TopNav

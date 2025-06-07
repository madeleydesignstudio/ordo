import { createFileRoute, Outlet, useLocation } from '@tanstack/react-router'
import { ViewType } from '@workspace/ui/components/dashboard/project-manager/view-container'
import React from 'react'

// Routes where the view selector should be displayed
const viewSelectorRoutes = [
  '/project-manager/projects',
  '/project-manager/tasks',
  '/project-manager/notes',
]

// Create a context for the active view
export const ViewContext = React.createContext<{ 
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
}>({ 
  activeView: 'kanban', 
  setActiveView: () => {} 
})

// Export a hook to use the ViewContext
export const useProjectManagerView = () => React.useContext(ViewContext)

export const Route = createFileRoute('/project-manager')({
  component: ProjectManagerLayout,
})

function ProjectManagerLayout() {
  const location = useLocation()
  
  // Keep the active view in the layout so it persists across route changes
  const [activeView, setActiveView] = React.useState<ViewType>('kanban')
  
  // Check if current route should enable view selection
  const shouldEnableViewSelector = viewSelectorRoutes.includes(location.pathname)
  
  // View change handler
  const handleViewChange = React.useCallback((viewType: ViewType) => {
    console.log('Project Manager Layout: View changed to', viewType)
    setActiveView(viewType)
    
    // Store the view selection in local storage so it persists across refreshes
    localStorage.setItem('projectManagerView', viewType)
  }, [])
  
  // On first mount, try to restore the view from localStorage
  React.useEffect(() => {
    const savedView = localStorage.getItem('projectManagerView') as ViewType | null
    if (savedView && ['kanban', 'list', 'table', 'calendar', 'gantt', 'classic'].includes(savedView)) {
      setActiveView(savedView as ViewType)
    }
  }, [])
  
  // Listen for global view changes
  React.useEffect(() => {
    const handleViewTypeChange = (event: CustomEvent) => {
      if (event.detail && event.detail.viewType) {
        console.log('Project Manager Layout: Received view change event:', event.detail.viewType)
        setActiveView(event.detail.viewType)
      }
    };
    
    // Add event listener
    window.addEventListener('viewTypeChanged', handleViewTypeChange as EventListener)
    
    // Clean up
    return () => {
      window.removeEventListener('viewTypeChanged', handleViewTypeChange as EventListener)
    }
  }, [])
  
  // Context value memoized to prevent unnecessary re-renders
  const contextValue = React.useMemo(() => ({
    activeView,
    setActiveView: handleViewChange
  }), [activeView, handleViewChange])
  
  // Log when the context value changes
  React.useEffect(() => {
    console.log('Project Manager Layout: Context value updated:', contextValue)
  }, [contextValue])
  
  return (
    <ViewContext.Provider value={contextValue}>
      <main>
        <Outlet />
      </main>
    </ViewContext.Provider>
  )
} 
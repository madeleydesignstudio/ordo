import { useLocation } from "@tanstack/react-router"
import BottomNav, { FocusModeProvider, useFocusMode } from "@workspace/ui/components/dashboard/main/bottomnav"
import Sidebar from "@workspace/ui/components/dashboard/main/sidebar"
import TopNav from "@workspace/ui/components/dashboard/main/topnav"
import { MobileRedirect } from "@workspace/ui/components/dashboard/providers/mobile-detector"
import { cn } from "@workspace/ui/lib/utils"
import * as React from "react"
import { trpc } from "../lib/trpc"
import { useUser } from "../routes/__root"

interface AppProviderProps {
  children: React.ReactNode
  className?: string
}

interface AppLayoutContextType {
  topNavHeight: number
  bottomNavHeight: number
  sideBarWidth: number
}

const AppLayoutContext = React.createContext<AppLayoutContextType>({
  topNavHeight: 40,
  bottomNavHeight: 20,
  sideBarWidth: 50,
})

export const useAppLayout = () => {
  const context = React.useContext(AppLayoutContext)
  if (!context) {
    throw new Error("useAppLayout must be used within an AppProvider")
  }
  return context
}

// Connected TopNav component with tRPC integration
const ConnectedTopNav = () => {
  // tRPC queries and mutations
  const projectsQuery = trpc.projects.list.useQuery()
  const tasksQuery = trpc.tasks.list.useQuery()
  const createProjectMutation = trpc.projects.create.useMutation()
  const createTaskMutation = trpc.tasks.create.useMutation()
  const location = useLocation()
  const user = useUser()
  
  // Prepare data for forms - convert tRPC responses to proper types
  const projects = (projectsQuery.data || []).map(project => ({
    id: project.id,
    name: project.name,
  }))

  const tasks = (tasksQuery.data || []).map((task: any) => ({
    id: task.id,
    name: task.name,
  }))

  // Create functions
  const createProject = async (data: any) => {
    await createProjectMutation.mutateAsync({
      name: data.name,
      description: data.description,
      icon: data.icon,
      cover: data.cover,
      startDate: data.startDate,
      dueDate: data.dueDate,
      status: data.status,
      parentProjectId: data.parentProjectId,
    })
  }

  const createTask = async (data: any) => {
    await createTaskMutation.mutateAsync({
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
  }

  return (
    <TopNav
      projects={projects}
      tasks={tasks}
      createProject={createProject}
      createTask={createTask}
      isCreatingProject={createProjectMutation.isPending}
      isCreatingTask={createTaskMutation.isPending}
      refetchProjects={() => projectsQuery.refetch()}
      refetchTasks={() => tasksQuery.refetch()}
      user={user}
    />
  )
}

const AppLayoutContent = ({ children, className }: AppProviderProps) => {
  const user = useUser()
  const { isFocusMode } = useFocusMode()
  
  // Debug logging
  React.useEffect(() => {
    console.log('AppProvider user data:', user)
    if (user?.image) {
      console.log('User has profile image:', user.image)
    }
  }, [user])
  
  const layoutConfig = {
    topNavHeight: 40,
    bottomNavHeight: 20,
    sideBarWidth: 50,
  }

  return (
    <AppLayoutContext.Provider value={layoutConfig}>
      <div className={cn("h-screen w-full overflow-hidden", className)}>
        {/* Side Bar - Hidden in focus mode */}
        <div 
          className={cn(
            "fixed left-0 top-0 bottom-0 z-40 transition-transform duration-300 ease-in-out",
            isFocusMode ? "-translate-x-full" : "translate-x-0"
          )}
          style={{
            width: `${layoutConfig.sideBarWidth}px`,
          }}
        >
          <Sidebar user={user} />
        </div>
        
        {/* Top Navigation - Hidden in focus mode */}
        <div 
          className={cn(
            "fixed top-0 right-0 z-50 transition-all duration-300 ease-in-out",
            isFocusMode ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"
          )}
          style={{ 
            height: `${layoutConfig.topNavHeight}px`,
            left: `${layoutConfig.sideBarWidth}px`
          }}
        >
         <ConnectedTopNav />
        </div>

        {/* Content Area - Adjusts based on focus mode */}
        <div 
          className={cn(
            "overflow-hidden bg-stone-100 transition-all duration-300 ease-in-out",
            "border-y border-l border-stone-300 rounded-l-lg"
          )}
          style={{
            marginTop: isFocusMode ? '10px' : `${layoutConfig.topNavHeight}px`,
            marginLeft: isFocusMode ? '10px' : `${layoutConfig.sideBarWidth}px`,
            marginBottom: `${layoutConfig.bottomNavHeight}px`,
            marginRight: isFocusMode ? '0px' : '0px',
            height: isFocusMode 
              ? `calc(100vh - ${layoutConfig.bottomNavHeight + 10}px)`
              : `calc(100vh - ${layoutConfig.topNavHeight + layoutConfig.bottomNavHeight}px)`,
            width: isFocusMode 
              ? `calc(100vw - 10px)`
              : `calc(100vw - ${layoutConfig.sideBarWidth}px)`
          }}
        >
          {children}
        </div>

        {/* Bottom Navigation - Always visible */}
        <div 
          className="fixed bottom-0 right-0 z-50 transition-all duration-300 ease-in-out"
          style={{ 
            height: `${layoutConfig.bottomNavHeight}px`,
            left: isFocusMode ? '0px' : `${layoutConfig.sideBarWidth}px`
          }}
        >
          <BottomNav />
        </div>
      </div>
    </AppLayoutContext.Provider>
  )
}

export function AppProvider({ children, className }: AppProviderProps) {
  return (
  
    <MobileRedirect>
       <FocusModeProvider>
      <AppLayoutContent className={className}>
        {children}
      </AppLayoutContent>
    </FocusModeProvider>
    </MobileRedirect>
   
   
  )
}

export default AppProvider 
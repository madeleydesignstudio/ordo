import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"
import Sidebar from "@workspace/ui/components/dashboard/main/sidebar"
import BottomNav from "@workspace/ui/components/dashboard/main/bottomnav"
import TopNav from "@workspace/ui/components/dashboard/main/topnav"
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
  topNavHeight: 30,
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

export function AppProvider({
  children,
  className,
}: AppProviderProps) {
  const user = useUser() // Direct access to user context from dashboard
  
  // Debug logging
  React.useEffect(() => {
    console.log('AppProvider user data:', user)
    if (user?.image) {
      console.log('User has profile image:', user.image)
    }
  }, [user])
  
  const layoutConfig = {
    topNavHeight: 30,
    bottomNavHeight: 20,
    sideBarWidth: 50,
  }

  return (
    <AppLayoutContext.Provider value={layoutConfig}>
      <div className={cn("h-screen w-full overflow-hidden", className)}>
        {/* Side Bar */}
        <div 
          className="fixed left-0 top-0 bottom-0 z-40"
          style={{
            width: `${layoutConfig.sideBarWidth}px`,
          }}
        >
          <Sidebar user={user} />
        </div>
        
        {/* Top Navigation */}
        <div 
          className="fixed top-0 right-0 z-50"
          style={{ 
            height: `${layoutConfig.topNavHeight}px`,
            left: `${layoutConfig.sideBarWidth}px`
          }}
        >
         <TopNav />
        </div>

        {/* Content Area */}
        <div 
          className="overflow-hidden bg-stone-100 rounded-l-lg border-y border-l border-stone-300"
          style={{
            marginTop: `${layoutConfig.topNavHeight}px`,
            marginLeft: `${layoutConfig.sideBarWidth}px`,
            marginBottom: `${layoutConfig.bottomNavHeight}px`,
            height: `calc(100vh - ${layoutConfig.topNavHeight + layoutConfig.bottomNavHeight}px)`,
          }}
        >
          {children}
        </div>

        {/* Bottom Navigation */}
        <div 
          className="fixed bottom-0 right-0 z-50"
          style={{ 
            height: `${layoutConfig.bottomNavHeight}px`,
            left: `${layoutConfig.sideBarWidth}px`
          }}
        >
          <BottomNav />
        </div>
      </div>
    </AppLayoutContext.Provider>
  )
}

export default AppProvider 
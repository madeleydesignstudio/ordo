import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"
import Sidebar from "../main/sidebar"
import BottomNav from "../main/bottomnav"
import TopNav from "../main/topnav"

interface AppProviderProps {
  children: React.ReactNode
  topNav?: React.ReactNode
  bottomNav?: React.ReactNode
  sideBar?: React.ReactNode
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
          <Sidebar />
        </div>
        {/* Top Navigation */}
        <div 
          className="fixed top-0 right-0 z-50"
          style={{ height: `${layoutConfig.topNavHeight}px` }}
        >
         <TopNav />
        </div>

      

        {/* Content Area */}
        <div 
          className="overflow-hidden bg-stone-200 rounded-l-lg border-y border-l border-stone-400"
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
          className="fixed bottom-0 right-0 z-50 "
          style={{ height: `${layoutConfig.bottomNavHeight}px` }}
        >
          <BottomNav />
        </div>
      </div>
    </AppLayoutContext.Provider>
  )
}

export { AppProvider as default }

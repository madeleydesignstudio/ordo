import appCss from "@/styles/app.css?url"
import { QueryClient } from '@tanstack/react-query'
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
  useLocation,
  useNavigate,
} from '@tanstack/react-router'
import { Toaster } from "@workspace/ui/components/sonner"
import { usePostHog } from 'posthog-js/react'
import { createContext, useContext, useEffect } from 'react'
import AppProvider from "../components/app-provider"
import { TRPCProvider } from "../components/trpc-provider"
import { useAuth } from '../hooks/use-auth'
import { ModeProvider } from '../hooks/use-mode'

export interface RouterContext {
  queryClient: QueryClient
  user: any | null
  authClient: any
}

const UserContext = createContext<any>(null)
export const useUser = () => useContext(UserContext)

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Ordo - Project Management',
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  const navigate = useNavigate()
  const location = useLocation()
  const posthog = usePostHog()
  const { user, isAuthenticated, isLoading } = useAuth()
  
  // Define routes that don't require authentication
  const publicRoutes = ['/login', '/signup']
  const isPublicRoute = publicRoutes.some(route => location.pathname.startsWith(route))

  useEffect(() => {
    // Don't redirect while still loading
    if (isLoading) return
    
    // Redirect to login if not authenticated and on protected route
    if (!isAuthenticated && !isPublicRoute) {
      navigate({ to: '/login' })
      return
    }
    
    // Add mode-based redirect for the root route
    if (isAuthenticated && location.pathname === '/') {
      // Check localStorage directly for the mode
      const savedMode = typeof window !== 'undefined' 
        ? localStorage.getItem('appMode') 
        : null
      
      // Redirect based on the saved mode
      if (savedMode === 'home') {
        navigate({ to: '/home' })
      } else {
        navigate({ to: '/business' })
      }
    }
    
    // Identify user with PostHog
    if (user && posthog) {
      posthog.identify(user.id, {
        email: user.email,
        name: user.name,
      })
    }
  }, [navigate, location.pathname, isPublicRoute, isAuthenticated, isLoading, user, posthog])

  // Show loading screen for protected routes
  if (isLoading && !isPublicRoute) {
    return (
      <RootDocument>
        <div className="h-screen w-full flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 border-4 border-stone-200 border-t-stone-600 rounded-full animate-spin"></div>
            <p className="text-stone-600">Loading...</p>
          </div>
        </div>
      </RootDocument>
    )
  }

  return (
    <RootDocument>
      <ModeProvider>
      <UserContext.Provider value={user}>
        <TRPCProvider>
          {isPublicRoute ? (
            <Outlet />
          ) : (
            <AppProvider>
              <Outlet />
            </AppProvider>
          )}
        </TRPCProvider>
      </UserContext.Provider>
      </ModeProvider>
    </RootDocument>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
        <Toaster position="bottom-right" />
      </body>
    </html>
  )
}
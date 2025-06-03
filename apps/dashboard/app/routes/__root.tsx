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
import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useState } from 'react'
import authClient from '../auth/auth-client'
import { usePostHog } from 'posthog-js/react'
import AppProvider from "../components/app-provider"
import { TRPCProvider } from "../components/trpc-provider"
import { Toaster } from "@workspace/ui/components/sonner"




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
        title: 'TanStack Start Starter',
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
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()
  const posthog = usePostHog()
  
  // Define routes that don't require authentication
  const publicRoutes = ['/login', '/signup']
  const isPublicRoute = publicRoutes.some(route => location.pathname.startsWith(route))
  
  useEffect(() => {
    async function checkAuth() {
      console.log('=== ROOT AUTH CHECK START ===')
      console.log('Current path:', location.pathname)
      console.log('Is public route:', isPublicRoute)
      
      try {
        const session = await authClient.getSession()
        console.log('Session response:', session)
        
        if (!session.data?.user) {
          console.log('No user found')
          setUser(null)
          
          if (!isPublicRoute) {
            console.log('Redirecting to login')
            navigate({ to: '/login' })
            return
          }
        } else {
          console.log('User found:', session.data.user)
          console.log('User image:', session.data.user.image)
          const userData = session.data.user
          setUser(userData)
          
          if (posthog && userData.id) {
            console.log('Identifying user with PostHog:', userData.id)
            posthog.identify(userData.id, {
              email: userData.email,
              name: userData.name,
              emailVerified: userData.emailVerified,
              createdAt: userData.createdAt,
            })
          }
        }
      } catch (error) {
        console.error('Auth check error:', error)
        setUser(null)
        
        if (!isPublicRoute) {
          navigate({ to: '/login' })
        }
      } finally {
        setLoading(false)
      }
    }
    
    checkAuth()
  }, [navigate, location.pathname, isPublicRoute, posthog])

  if (loading && !isPublicRoute) {
    return (
      <RootDocument>
        <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100">
          <div className="flex flex-col items-center space-y-6 p-8">
            {/* Animated Logo/Spinner */}
            <div className="relative">
              <div className="w-16 h-16 border-4 border-stone-200 border-t-stone-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-stone-400 rounded-full animate-spin animation-delay-150"></div>
            </div>
            
            {/* Loading Text */}
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-stone-800 tracking-tight">
                Loading your workspace
              </h2>
              <p className="text-sm text-stone-600 max-w-sm">
                Setting up your personalized dashboard experience
              </p>
            </div>
            
            {/* Progress Dots */}
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-stone-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-stone-400 rounded-full animate-pulse animation-delay-200"></div>
              <div className="w-2 h-2 bg-stone-400 rounded-full animate-pulse animation-delay-400"></div>
            </div>
          </div>
        </div>
      </RootDocument>
    )
  }

  if (!isPublicRoute && !user && !loading) {
    return null
  }

  return (
    <RootDocument>
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
    </RootDocument>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
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
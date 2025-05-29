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
import "@ordo/ui-web/styles/globals.css"

export interface RouterContext {
  queryClient: QueryClient
  user: any | null
  authClient: any
}

// Create React Context for user
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
        <div className="flex items-center justify-center h-screen">
          <div className="text-lg">Loading...</div>
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
        <Outlet />
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
      </body>
    </html>
  )
}
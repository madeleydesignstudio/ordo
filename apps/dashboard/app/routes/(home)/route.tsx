import { createFileRoute, Outlet, redirect, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { usePostHog } from 'posthog-js/react'
import authClient from '../../auth/auth-client'

export const Route = createFileRoute('/(home)')({
  component: ProtectedLayout,
  // Remove server-side auth check since cookies aren't available in SSR
})

function ProtectedLayout() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)
  const navigate = useNavigate()
  const posthog = usePostHog()
  
  useEffect(() => {
    async function checkAuth() {
      console.log('=== CLIENT-SIDE AUTH CHECK START ===')
      try {
        console.log('1. Starting session check...')
        const session = await authClient.getSession()
        console.log('2. Session response:', session)
        
        if (!session.data?.user) {
          console.log('3. No user found, redirecting to login')
          navigate({ to: '/login' })
          return
        }
        
        console.log('4. User found:', session.data.user)
        const userData = session.data.user
        setUser(userData)
        
        // Identify user with PostHog
        if (posthog && userData.id) {
          console.log('5. Identifying user with PostHog:', userData.id)
          posthog.identify(userData.id, {
            email: userData.email,
            name: userData.name,
            emailVerified: userData.emailVerified,
            createdAt: userData.createdAt,
          })
          
          // Track login event
          posthog.capture('user_logged_in', {
            email: userData.email,
            name: userData.name,
          })
        }
      } catch (error) {
        console.error('5. Auth check error:', error)
        navigate({ to: '/login' })
      } finally {
        setLoading(false)
      }
    }
    
    checkAuth()
  }, [navigate, posthog])

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      // Track logout event before signing out
      if (posthog && user) {
        posthog.capture('user_logged_out', {
          email: user.email,
          name: user.name,
        })
      }
      
      await authClient.signOut()
      
      // Reset PostHog user identification
      if (posthog) {
        posthog.reset()
      }
      
      navigate({ to: '/login' })
    } catch (error) {
      console.error('Logout error:', error)
      // Navigate to login anyway
      navigate({ to: '/login' })
    }
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }
  
  if (!user) {
    return null // Will redirect to login
  }
  
  return (
    <div>
      {/* Navigation bar with user info */}
      <nav className="p-4 bg-gray-100 border-b">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Dashboard</h1>
          
          {/* User info and logout */}
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <div className="font-medium">{user?.name || 'Unknown User'}</div>
              <div className="text-gray-600">{user?.email || 'No email'}</div>
            </div>
            {user?.image && (
              <img 
                src={user.image} 
                alt="Profile" 
                className="w-8 h-8 rounded-full"
              />
            )}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
            >
              {loggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </div>
      </nav>
      
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  )
} 
import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { usePostHog } from 'posthog-js/react'
import { useState } from 'react'
import authClient from '../../auth/auth-client'
import { useUser } from '../__root'

export const Route = createFileRoute('/(home)')({
  component: ProtectedLayout,
})

function ProtectedLayout() {
  const [loggingOut, setLoggingOut] = useState(false)
  const navigate = useNavigate()
  const posthog = usePostHog()
  
  // Use the React Context hook instead of router context
  const user = useUser()

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
  setLoggingOut(false)
   navigate({ to: '/login' })
 }
  }

  // Debug: Log the user to see what we're getting
  console.log('Home route user:', user)
  
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
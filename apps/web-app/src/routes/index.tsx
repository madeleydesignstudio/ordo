// src/routes/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { auth, db } from '@workspace/supabase'
import { AuthCard } from '@workspace/ui/components/auth-card'
import { GoogleAuthButton } from '@workspace/ui/components/auth-button'
import { Button } from '@workspace/ui/components/button'
import { TaskList } from '@workspace/ui/components/task-list'
import type { User } from '@supabase/supabase-js'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check current session
        const currentUser = await auth.getCurrentUser()
        setUser(currentUser)
        setLoading(false)
      } catch (err) {
        console.error('Auth init error:', err)
        setLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange((newUser) => {
      setUser(newUser)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleGoogleSignIn = async () => {
    try {
      setAuthLoading(true)
      setError(null)
      
      // Simple Google OAuth - Supabase handles the redirect
      const { error } = await auth.signInWithGoogle()
      
      if (error) {
        setError(error.message)
      }
      // No need to handle success here - auth state change will handle it
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Sign in error:', err)
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      setAuthLoading(true)
      await auth.signOut()
      setUser(null)
    } catch (err) {
      setError('Failed to sign out')
      console.error('Sign out error:', err)
    } finally {
      setAuthLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <AuthCard 
        title="Welcome to Ordo"
        description="Sign in to your account to continue"
      >
        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Authentication Error
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <GoogleAuthButton 
          onClick={handleGoogleSignIn}
          loading={authLoading}
        />

        <div className="text-center">
          <p className="text-sm text-gray-600">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </AuthCard>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Ordo</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {user.user_metadata?.avatar_url && (
                  <img 
                    src={user.user_metadata.avatar_url} 
                    alt="Profile" 
                    className="h-8 w-8 rounded-full"
                  />
                )}
                <span className="text-sm text-gray-700">
                  {user.user_metadata?.full_name || user.email}
                </span>
              </div>
              <Button 
                variant="outline" 
                onClick={handleSignOut}
                disabled={authLoading}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <TaskList user={user} db={db} />
      </div>
    </div>
  )
}
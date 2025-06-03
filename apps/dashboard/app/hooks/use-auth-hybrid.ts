import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import authClient from '../auth/auth-client'
import { trpc } from '../lib/trpc'

export function useAuthHybrid() {
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)

  // Use tRPC for session management (consistent with app architecture)
  const { data: session, isLoading: sessionLoading, refetch: refetchSession } = 
    trpc.auth.getSession.useQuery()

  // Use tRPC for sign out (simple operation, benefits from type safety)
  const signOutMutation = trpc.auth.signOut.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries()
      refetchSession()
    },
  })

  // Use Better-Auth directly for OAuth (complex flow, works best directly)
  const signInWithGoogle = async (callbackURL?: string) => {
    setIsLoading(true)
    
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: callbackURL || (
          typeof window !== 'undefined' && window.location.hostname === 'localhost'
            ? import.meta.env.VITE_DASHBOARD_DEV_URL
            : import.meta.env.VITE_DASHBOARD_PROD_URL
        ),
      })
      
      // After successful OAuth, refresh session via tRPC
      await refetchSession()
    } catch (error) {
      console.error('OAuth sign-in failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    try {
      await signOutMutation.mutateAsync()
    } catch (error) {
      console.error('Sign out failed:', error)
      throw error
    }
  }

  return {
    // Session state
    session,
    isAuthenticated: !!session?.data?.user,
    isLoading: sessionLoading || isLoading || signOutMutation.isPending,
    
    // Auth actions
    signInWithGoogle,
    signOut,
    refetchSession,
  }
} 
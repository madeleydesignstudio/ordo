import { useState, useEffect } from 'react'
import authClient from '../auth/auth-client'

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const checkSession = async () => {
    try {
      console.log('🔍 Checking session with Better Auth...')
      
      const result = await authClient.getSession()
      console.log('📊 Better Auth result:', result)
      
      if (result?.data?.user) {
        console.log('✅ User authenticated:', result.data.user.email)
        setUser(result.data.user)
      } else {
        console.log('❌ No authenticated user')
        setUser(null)
      }
    } catch (error) {
      console.error('❌ Session check failed:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    console.log('🚀 Auth hook mounted')
    
    // Check if we're returning from OAuth callback
    const urlParams = new URLSearchParams(window.location.search)
    const hasCode = urlParams.has('code') || urlParams.has('state')
    
    if (hasCode) {
      console.log('🔄 OAuth callback detected, waiting before session check...')
      // Wait for OAuth to complete
      const timer = setTimeout(() => {
        checkSession()
      }, 2000)
      return () => clearTimeout(timer)
    } else {
      // Regular session check
      checkSession()
    }
  }, [])

  const signInWithGoogle = async () => {
    console.log('🔐 Starting Google OAuth...')
    const callbackURL = window.location.hostname === 'localhost'
      ? 'http://localhost:3001'
      : 'https://dashboard.dev-0af.workers.dev'

    console.log('📍 Callback URL:', callbackURL)
    
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL,
      })
      console.log('✅ OAuth redirect initiated')
    } catch (error) {
      console.error('❌ OAuth failed:', error)
      throw error
    }
  }

  const signOut = async () => {
    console.log('👋 Signing out...')
    try {
      await authClient.signOut()
      setUser(null)
      console.log('✅ Signed out successfully')
      window.location.href = '/login'
    } catch (error) {
      console.error('❌ Sign out failed:', error)
      setUser(null)
      window.location.href = '/login'
    }
  }

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    signInWithGoogle,
    signOut,
    refetch: checkSession,
  }
} 
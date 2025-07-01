import { useState } from 'react'
import { auth } from '@workspace/supabase'
import { AuthCard } from '@workspace/ui/components/auth-card'
import { GoogleAuthButton } from '@workspace/ui/components/auth-button'

interface LoginProps {
  onLogin: () => void
}

export function Login({ onLogin }: LoginProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Simple Google OAuth - opens system browser
      const { error } = await auth.signInWithGoogle()
      
      if (error) {
        setError(error.message)
      } else {
        // Success will be handled by auth state change listener in App.tsx
        onLogin()
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Sign in error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
          loading={loading}
        />

        <div className="text-center">
          <p className="text-sm text-gray-600">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </AuthCard>
    </div>
  )
} 
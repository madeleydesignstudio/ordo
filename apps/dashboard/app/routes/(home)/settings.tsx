import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useUser } from '../__root'
import { Button } from '@workspace/ui/components/button'
import { Label } from '@workspace/ui/components/label'
import { ScrollArea } from '@workspace/ui/components/scroll-area'
import { useAuth } from '../../hooks/use-auth'
import { useState } from 'react'
import { User, Mail, Calendar, Globe, Shield, LogOut, Image } from 'lucide-react'
import { toast } from 'sonner'

export const Route = createFileRoute('/(home)/settings')({
  component: RouteComponent,
})

function RouteComponent() {
  const user = useUser()
  const navigate = useNavigate()
  const { signOut, isLoading: isAuthLoading } = useAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    
    // Show loading toast
    const loadingToast = toast.loading('Logging out...', {
      description: 'Please wait while we sign you out securely',
    })
    
    try {
      // Use Better-Auth directly for sign out
      await signOut()
      
      console.log('Sign out successful, redirecting to login')
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingToast)
      toast.success('Successfully logged out', {
        description: 'You have been signed out securely',
        duration: 1000,
      })
      
      // Navigate immediately since signOut() now ensures the session is properly cleared
      navigate({ to: '/login' })
    } catch (error) {
      console.error('Sign out failed:', error)
      
      // Dismiss loading toast and show error
      toast.dismiss(loadingToast)
      toast.error('Sign out failed', {
        description: 'There was an error signing you out. Please try again.',
        duration: 3000,
      })
    } finally {
      setIsSigningOut(false)
    }
  }

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">Loading user data...</div>
      </div>
    )
  }

  return (
    <ScrollArea className="h-[calc(100vh-80px)]">
      <div className="p-6 max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Account Settings</h1>
          <Button 
            variant="destructive" 
            onClick={handleSignOut}
            disabled={isSigningOut || isAuthLoading}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            {(isSigningOut || isAuthLoading) ? 'Signing out...' : 'Sign Out'}
          </Button>
        </div>

        {/* Profile Section */}
        <div className="bg-white rounded-lg border p-6 space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Image */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                Profile Image
              </Label>
              <div className="flex items-center gap-4">
                {user.image ? (
                  <img 
                    src={user.image} 
                    alt={user.name} 
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="text-sm text-muted-foreground">
                  {user.image ? 'Google Profile Image' : 'No image available'}
                </div>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Full Name
              </Label>
              <div className="p-3 border rounded-md bg-gray-50">
                {user.name}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              <div className="p-3 border rounded-md bg-gray-50 flex items-center justify-between">
                <span>{user.email}</span>
                {user.emailVerified && (
                  <div className="flex items-center gap-1 text-green-600">
                    <Shield className="h-4 w-4" />
                    <span className="text-xs">Verified</span>
                  </div>
                )}
              </div>
            </div>

            {/* User ID */}
            <div className="space-y-2">
              <Label>User ID</Label>
              <div className="p-3 border rounded-md bg-gray-50 font-mono text-xs">
                {user.id}
              </div>
            </div>

            {/* Country */}
            {user.country && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Country
                </Label>
                <div className="p-3 border rounded-md bg-gray-50">
                  {user.country}
                </div>
              </div>
            )}

            {/* Account Created */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Account Created
              </Label>
              <div className="p-3 border rounded-md bg-gray-50">
                {formatDate(user.createdAt)}
              </div>
            </div>

            {/* Last Updated */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Last Updated
              </Label>
              <div className="p-3 border rounded-md bg-gray-50">
                {formatDate(user.updatedAt)}
              </div>
            </div>
          </div>
        </div>

        {/* Onboarding Status */}
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <h2 className="text-xl font-semibold">Onboarding Status</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Onboarding Started</Label>
              <div className={`p-3 border rounded-md ${user.onboardingStarted ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
                {user.onboardingStarted ? 'Yes' : 'No'}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Current Step</Label>
              <div className="p-3 border rounded-md bg-gray-50">
                Step {user.onboardingStep}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Onboarding Completed</Label>
              <div className={`p-3 border rounded-md ${user.onboardingCompleted ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                {user.onboardingCompleted ? 'Completed' : 'In Progress'}
              </div>
            </div>
          </div>
        </div>

        {/* Google OAuth Information */}
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <h2 className="text-xl font-semibold">Google OAuth Details</h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h3 className="font-medium text-blue-900 mb-2">Authentication Provider</h3>
              <p className="text-blue-700">
                Your account is authenticated through Google OAuth 2.0. This provides secure access 
                using your Google account credentials.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Provider</Label>
                <div className="p-3 border rounded-md bg-gray-50">
                  Google OAuth 2.0
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email Verification Status</Label>
                <div className={`p-3 border rounded-md flex items-center gap-2 ${user.emailVerified ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                  <Shield className="h-4 w-4" />
                  {user.emailVerified ? 'Verified by Google' : 'Not Verified'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}

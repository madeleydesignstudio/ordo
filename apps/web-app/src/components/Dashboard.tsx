import { useState } from 'react'
import { useAuth, useUser } from '@clerk/tanstack-react-start'
import { trpc } from '../lib/trpc'
import { UserButton } from './auth/UserButton'
import { SignInButton } from './auth/SignInButton'

export function Dashboard() {
  const { isSignedIn } = useAuth()
  const { user, isLoaded } = useUser() // Get user data directly from Clerk
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  // Only keep application-specific tRPC queries
  const hello = trpc.hello.useQuery({ name: user?.firstName || 'Ordo User' })

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName.trim() && !lastName.trim()) return
    if (!user) return

    setIsUpdating(true)
    try {
      // Update user profile directly with Clerk
      await user.update({
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
      })
      
      setIsEditing(false)
      setFirstName('')
      setLastName('')
    } catch (error) {
      console.error('Error updating profile:', error)
      // You might want to show an error message to the user here
    } finally {
      setIsUpdating(false)
    }
  }

  const startEditing = () => {
    setFirstName(user?.firstName || '')
    setLastName(user?.lastName || '')
    setIsEditing(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Ordo Dashboard</h1>
          <div className="flex items-center gap-4">
            <SignInButton />
            <UserButton />
          </div>
        </div>

        {/* Welcome Message */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Welcome to Ordo</h2>
          {hello.isLoading ? (
            <p>Loading...</p>
          ) : hello.error ? (
            <p className="text-red-600">Error: {hello.error.message}</p>
          ) : (
            <p className="text-green-600">{hello.data?.greeting}</p>
          )}
        </div>

        {/* User Profile Information */}
        {isSignedIn && (
          <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Profile Information</h2>
              {!isEditing && (
                <button
                  onClick={startEditing}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm"
                >
                  Edit Profile
                </button>
              )}
            </div>
            
            {!isLoaded ? (
              <p>Loading profile...</p>
            ) : (
              <div className="space-y-4">
                {!isEditing ? (
                  // Display mode - data comes directly from Clerk
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <p className="text-gray-900">{user?.primaryEmailAddress?.emailAddress || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        User ID
                      </label>
                      <p className="text-gray-900 font-mono text-sm">{user?.id}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <p className="text-gray-900">{user?.firstName || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <p className="text-gray-900">{user?.lastName || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Member Since
                      </label>
                      <p className="text-gray-900">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Updated
                      </label>
                      <p className="text-gray-900">
                        {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                  </div>
                ) : (
                  // Edit mode - updates directly through Clerk
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter first name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter last name"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={isUpdating}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                      >
                        {isUpdating ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        )}

        {/* Authentication Status */}
        {!isSignedIn && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Get Started</h2>
            <p className="text-gray-600 mb-4">
              Sign in to access your profile and manage your account settings.
            </p>
            <SignInButton />
          </div>
        )}
      </div>
    </div>
  )
} 
import { UserButton as ClerkUserButton, useAuth, useUser } from '@clerk/tanstack-react-start'

export function UserButton() {
  const { isSignedIn } = useAuth()
  const { user } = useUser()

  if (!isSignedIn || !user) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">
        Welcome, {user.firstName || user.primaryEmailAddress?.emailAddress}
      </span>
      <ClerkUserButton 
        appearance={{
          elements: {
            avatarBox: "w-8 h-8"
          }
        }}
      />
    </div>
  )
} 
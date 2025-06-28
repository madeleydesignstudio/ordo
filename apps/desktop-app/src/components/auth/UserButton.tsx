import { UserButton as ClerkUserButton, useAuth, useUser } from '@clerk/clerk-react'

export function UserButton() {
  const { isSignedIn } = useAuth()
  const { user } = useUser()

  if (!isSignedIn || !user) {
    return null
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ fontSize: '14px', color: '#666' }}>
        Welcome, {user.firstName || user.primaryEmailAddress?.emailAddress}
      </span>
      <ClerkUserButton 
        appearance={{
          elements: {
            avatarBox: "width: 32px; height: 32px;"
          }
        }}
      />
    </div>
  )
} 
import { SignInButton as ClerkSignInButton, useAuth } from '@clerk/tanstack-react-start'

export function SignInButton() {
  const { isSignedIn } = useAuth()

  if (isSignedIn) {
    return null
  }

  return (
    <ClerkSignInButton mode="modal">
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Sign In
      </button>
    </ClerkSignInButton>
  )
} 
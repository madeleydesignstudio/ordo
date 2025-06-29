import { useAuth } from '@clerk/tanstack-react-start'
import { UserButton } from './auth/UserButton'
import { SignInButton } from './auth/SignInButton'
import { TaskList } from './TaskList'
import { trpc } from '../lib/trpc'

export function Dashboard() {
  const { isSignedIn } = useAuth()

  // Get user ID for debugging
  const userIdQuery = trpc.getUserId.useQuery(undefined, {
    enabled: isSignedIn
  })

  const handleShowUserId = () => {
    if (userIdQuery.data?.userId) {
      alert(`Your User ID: ${userIdQuery.data.userId}`)
      console.log('User ID:', userIdQuery.data.userId)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Ordo</h1>
          <div className="flex items-center space-x-4">
            {isSignedIn && (
              <button
                onClick={handleShowUserId}
                className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded"
              >
                Show User ID
              </button>
            )}
            <SignInButton />
            <UserButton />
          </div>
        </header>

        <main>
          {isSignedIn ? (
            <TaskList />
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Welcome to Ordo</h2>
              <p className="text-gray-600 mb-6">Please sign in to access your personal dashboard and view your tasks.</p>
              <SignInButton />
            </div>
          )}
        </main>
      </div>
    </div>
  )
} 
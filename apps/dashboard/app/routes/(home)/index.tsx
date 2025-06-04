// app/routes/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { useUser } from '../__root'

export const Route = createFileRoute('/(home)/')({
  component: Dashboard,
})

function Dashboard() {
  const user = useUser()

  console.log('🏠 Dashboard rendered, user:', user)

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Welcome to Ordo</h1>
      {user ? (
        <div>
          <p className="text-green-600 mb-2">✅ Successfully authenticated!</p>
          <p>Welcome, {user.name || user.email}!</p>
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <h3 className="font-medium mb-2">User Info:</h3>
            <pre className="text-sm">{JSON.stringify(user, null, 2)}</pre>
          </div>
        </div>
      ) : (
        <p className="text-red-600">❌ Not authenticated</p>
      )}
    </div>
  )
}
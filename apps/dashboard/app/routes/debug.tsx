import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import authClient from '../auth/auth-client'

export const Route = createFileRoute('/debug')({
  component: DebugPage,
})

function DebugPage() {
  const [sessionData, setSessionData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testSession = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('Testing session...')
      const session = await authClient.getSession()
      console.log('Session result:', session)
      setSessionData(session)
    } catch (err) {
      console.error('Session error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Debug Page</h1>
      
      <button 
        onClick={testSession}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        {loading ? 'Testing...' : 'Test Session'}
      </button>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}

      {sessionData && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <h2 className="font-bold mb-2">Session Data:</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(sessionData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
} 
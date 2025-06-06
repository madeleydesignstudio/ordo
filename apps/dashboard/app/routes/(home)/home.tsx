import { createFileRoute } from '@tanstack/react-router'
import { useUser } from '../__root'

export const Route = createFileRoute('/(home)/home')({
  component: HomeComponent,
})

function HomeComponent() {
  const user = useUser()
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Home Mode</h1>
      <p className="mb-4">Welcome to your personal dashboard, {user?.name || 'User'}!</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
          <h2 className="text-xl font-semibold mb-3">Journal</h2>
          <p className="text-stone-600">Access your personal journal and notes</p>
          <a href="/journal" className="text-blue-600 mt-4 inline-block">Open Journal →</a>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
          <h2 className="text-xl font-semibold mb-3">Health Tracker</h2>
          <p className="text-stone-600">Monitor your health goals and progress</p>
          <a href="/health-manager" className="text-blue-600 mt-4 inline-block">View Health →</a>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
          <h2 className="text-xl font-semibold mb-3">Quick Settings</h2>
          <p className="text-stone-600">Manage your personal preferences</p>
          <a href="/settings" className="text-blue-600 mt-4 inline-block">Open Settings →</a>
        </div>
      </div>
    </div>
  )
}
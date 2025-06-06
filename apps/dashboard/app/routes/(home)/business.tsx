import { createFileRoute } from '@tanstack/react-router'
import { useUser } from '../__root'

export const Route = createFileRoute('/(home)/business')({
  component: BusinessComponent,
})

function BusinessComponent() {
  const user = useUser()
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Business Mode</h1>
      <p className="mb-4">Welcome to your workspace dashboard, {user?.name || 'User'}!</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
          <h2 className="text-xl font-semibold mb-3">Project Manager</h2>
          <p className="text-stone-600">Manage your projects and tasks</p>
          <a href="/project-manager" className="text-blue-600 mt-4 inline-block">Open Projects →</a>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
          <h2 className="text-xl font-semibold mb-3">Content Manager</h2>
          <p className="text-stone-600">Organize and create content</p>
          <a href="/content-manager" className="text-blue-600 mt-4 inline-block">View Content →</a>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
          <h2 className="text-xl font-semibold mb-3">Finance Manager</h2>
          <p className="text-stone-600">Track finances and budgets</p>
          <a href="/finance-manager" className="text-blue-600 mt-4 inline-block">Open Finances →</a>
        </div>
      </div>
    </div>
  )
}
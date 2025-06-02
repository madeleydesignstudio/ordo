// app/routes/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'


export const Route = createFileRoute('/(home)/')({
  component: Dashboard,
})

function Dashboard() {


  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
      
        </h2>
        <p className="text-gray-600 mb-6">
          You've successfully completed the onboarding process. Your workspace is ready to use.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium text-gray-900">Projects</h3>
            <p className="text-sm text-gray-600 mt-1">Manage your projects</p>
            <Button className="mt-3" size="sm">
              View Projects
            </Button>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium text-gray-900">Tasks</h3>
            <p className="text-sm text-gray-600 mt-1">Track your tasks</p>
            <Button className="mt-3" size="sm">
              View Tasks
            </Button>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium text-gray-900">Settings</h3>
            <p className="text-sm text-gray-600 mt-1">Configure your workspace</p>
            <Button className="mt-3" size="sm">
              Open Settings
            </Button>
          </div>
        </div>
      </div>
      
      {/* Debug info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-2">Debug Info</h3>
       
      </div>
    </div>
  )
}
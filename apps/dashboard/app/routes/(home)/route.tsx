import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/(home)')({
  component: ProtectedLayout,
  
})

function ProtectedLayout() {
 
  
  



  return (
    <div>
      {/* Navigation bar with user info */}
      <nav className="p-4 bg-gray-100 border-b">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Dashboard</h1>
          
          {/* User info and logout */}
          <div className="flex items-center gap-4">
            <div className="text-sm">
             
            </div>
          
         
          </div>
        </div>
      </nav>
      
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  )
} 
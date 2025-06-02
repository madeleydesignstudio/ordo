import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/(home)')({
  component: ProtectedLayout,
  
})

function ProtectedLayout() {
 
  
  



  return (
    <div>
     
      
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  )
} 
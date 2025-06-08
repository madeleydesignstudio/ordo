import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(home)/test')({
  component: RouteComponent,
})

function RouteComponent() {
  return (

      <div className="flex-1 flex items-center justify-center bg-red-400 rounded-lg h-[89vh] w-full">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full h-full">
          <h1 className="text-2xl font-bold mb-4">Test Route</h1>
          <p>This is the test route with proper full-size layout</p>
        </div>
    </div>
  )
}
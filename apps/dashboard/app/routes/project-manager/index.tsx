import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/project-manager/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div className='h-[93vh] w-[97.1vw] bg-red-300 flex justify-center items-center'>Hello</div>
}

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/project-manager/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/project-manager/dashboard"!</div>
}

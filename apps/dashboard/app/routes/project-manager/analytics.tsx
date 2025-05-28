import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/project-manager/analytics')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/project-manager/analytics"!</div>
}

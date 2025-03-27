import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/project-manager/notebooks')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/project-manager/notebooks"!</div>
}

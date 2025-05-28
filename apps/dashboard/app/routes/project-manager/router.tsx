import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/project-manager/router')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/project-manager/router"!</div>
}

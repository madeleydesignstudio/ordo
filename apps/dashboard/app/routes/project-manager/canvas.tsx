import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/project-manager/canvas')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/project-manager/canvas"!</div>
}

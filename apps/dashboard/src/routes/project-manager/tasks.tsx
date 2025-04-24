import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/project-manager/tasks')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/project-manager/tasks"!</div>
}

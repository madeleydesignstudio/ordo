import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/project-manager/notes')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/project-manager/notes"!</div>
}

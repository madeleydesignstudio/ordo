import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/project-manager/my-issues')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/project-manager/my-issues"!</div>
}

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/project-manager/project/$projectId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/project-manager/project/$projectId"!</div>
}

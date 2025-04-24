import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/project-manager/$projectSlug')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/project-manager/$projectSlug"!</div>
}

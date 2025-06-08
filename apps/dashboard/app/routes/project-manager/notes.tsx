import { createFileRoute } from '@tanstack/react-router'
import Notes from '@workspace/ui/components/dashboard/project-manager/notes'

export const Route = createFileRoute('/project-manager/notes')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div><Notes/></div>
}

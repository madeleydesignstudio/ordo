import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/content-manager/people')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/content-manager/people"!</div>
}

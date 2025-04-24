import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/content-manager/opportunities')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/content-manager/opportunities"!</div>
}

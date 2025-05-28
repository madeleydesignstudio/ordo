import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/health-manager/journal')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/health-manager/journal"!</div>
}

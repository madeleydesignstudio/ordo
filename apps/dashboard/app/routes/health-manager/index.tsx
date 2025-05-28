import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/health-manager/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/health-manager/"!</div>
}

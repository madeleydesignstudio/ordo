import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/health-manager/supplement-tracker')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/health-manager/supplement-tracker"!</div>
}

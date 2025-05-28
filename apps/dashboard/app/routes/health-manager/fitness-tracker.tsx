import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/health-manager/fitness-tracker')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/health-manager/fitness-tracker"!</div>
}

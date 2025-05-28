import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/finance-manager/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/finance-manager/dashboard"!</div>
}

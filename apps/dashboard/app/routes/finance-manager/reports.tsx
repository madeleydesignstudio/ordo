import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/finance-manager/reports')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/finance-manager/reports"!</div>
}

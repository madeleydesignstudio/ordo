import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/finance-manager/budgeting')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/finance-manager/budgeting"!</div>
}

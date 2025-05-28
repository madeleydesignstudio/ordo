import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/finance-manager/transactions')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/finance-manager/transactions"!</div>
}

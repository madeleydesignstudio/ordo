import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/finance-manager/router')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/finance-manager/router"!</div>
}

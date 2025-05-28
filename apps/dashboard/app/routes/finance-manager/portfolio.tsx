import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/finance-manager/portfolio')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/finance-manager/portfolio"!</div>
}

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/finance-manager/news')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/finance-manager/news"!</div>
}

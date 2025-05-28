import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/content-manager/reports')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/content-manager/reports"!</div>
}

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/content-manager/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/content-manager/dashboard"!</div>
}

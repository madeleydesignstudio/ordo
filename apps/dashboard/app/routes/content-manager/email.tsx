import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/content-manager/email')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/content-manager/email"!</div>
}

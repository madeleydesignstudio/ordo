import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/content-manager/inbox-zero')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/content-manager/inbox-zero"!</div>
}

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/content-manager/bulk-unsubscribe')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/content-manager/bulk-unsubscribe"!</div>
}

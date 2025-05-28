import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(home)/notifications')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(home)/notifications"!</div>
}

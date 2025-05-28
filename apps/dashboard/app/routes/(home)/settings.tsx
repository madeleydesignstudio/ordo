import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(home)/settings')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(home)/settings"!</div>
}

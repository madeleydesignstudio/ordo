import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(home)/journal')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(home)/journal"!</div>
}

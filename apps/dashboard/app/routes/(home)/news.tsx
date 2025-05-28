import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(home)/news')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(home)/news"!</div>
}

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/content-manager/company')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/content-manager/company"!</div>
}

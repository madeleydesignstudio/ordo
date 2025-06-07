import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(home)/bookmarks')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(home)/bookmarks"!</div>
}

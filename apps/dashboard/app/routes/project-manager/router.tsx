import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/project-manager/router')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div className="h-full w-full">
    <Outlet />
  </div>
}

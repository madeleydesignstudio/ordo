import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/finance-manager')({
  component: RouteComponent,
  loader: ({ context }) => {
    if (!context.user) {
      throw redirect({
        to: "/login",
      });
    }
    return { user: context.user };
  },
})

function RouteComponent() {
  return <div>Hello "/finance-manager"!</div>
}

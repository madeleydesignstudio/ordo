import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/content-manager')({
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
  return <div>Hello "/content-manager"!</div>
}

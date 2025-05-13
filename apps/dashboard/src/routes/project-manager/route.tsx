import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { ProjectLayoutProvider } from "~/components/project-manager/project-layout";

export const Route = createFileRoute("/project-manager")({
  component: RouteComponent,
  loader: ({ context }) => {
    if (!context.user) {
      throw redirect({
        to: "/login",
      });
    }
    return { user: context.user };
  },
});

function RouteComponent() {
  return (
    <ProjectLayoutProvider>
      <div>
        <Outlet />
      </div>
    </ProjectLayoutProvider>
  );
}

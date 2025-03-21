import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/project-manager")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/project-manager"!</div>;
}

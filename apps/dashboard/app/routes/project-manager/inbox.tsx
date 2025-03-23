import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/project-manager/inbox")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/project-manager/inbox"!</div>;
}

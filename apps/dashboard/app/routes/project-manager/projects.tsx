import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/project-manager/projects")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/project-manager/projects"!</div>;
}

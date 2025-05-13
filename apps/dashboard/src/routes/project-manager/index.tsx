import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/project-manager/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Navigate to="/project-manager/inbox" />;
}

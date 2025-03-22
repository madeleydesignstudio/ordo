import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/journal")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/journal"!</div>;
}

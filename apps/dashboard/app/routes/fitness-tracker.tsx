import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/fitness-tracker")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/fitness-tracker"!</div>;
}

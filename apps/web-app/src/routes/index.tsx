// src/routes/index.tsx
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@ordo/ui/components/button";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return <div className="">Hello</div>;
}

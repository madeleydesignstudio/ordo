// src/routes/index.tsx
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return <div>Hello</div>;
}

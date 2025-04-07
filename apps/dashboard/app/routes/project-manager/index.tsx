import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/project-manager/")({
  beforeLoad: () => {
    throw redirect({
      to: "/project-manager/inbox",
    });
  },
});

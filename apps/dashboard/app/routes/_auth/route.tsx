import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import authClient from "../../auth/auth-client";

export const Route = createFileRoute("/_auth")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="h-screen w-screen">
      <div className="h-full w-full">
        <Outlet />
      </div>
    </div>
  );
}

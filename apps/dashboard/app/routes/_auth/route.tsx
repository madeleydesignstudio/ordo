import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import authClient from "../../auth/auth-client";

export const Route = createFileRoute("/_auth")({
  component: RouteComponent,
  beforeLoad: async ({ context, location }) => {
    console.log("=== AUTH ROUTE BEFORELOAD ===");
    console.log("Checking auth for path:", location.pathname);
    
    // Temporarily disable server-side auth check to debug the issue
    // The client-side protection should handle this for now
    console.log("Server-side auth check temporarily disabled for debugging");
    
    /* 
    try {
      // Use the auth client directly to check session
      const session = await authClient.getSession();
      console.log("Auth check session:", session);
      
      if (session?.data?.user) {
        console.log("User is authenticated, redirecting to dashboard");
        throw redirect({ to: "/" });
      } else {
        console.log("No authenticated user found, allowing access to auth pages");
      }
    } catch (error) {
      // If there's an error checking auth, log it but allow access to auth pages
      console.error("Error checking auth:", error);
    }
    */
    
    return {};
  },
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

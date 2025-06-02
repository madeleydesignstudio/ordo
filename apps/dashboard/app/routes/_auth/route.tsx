import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    console.log("=== AUTH ROUTE BEFORELOAD ===");
    console.log("context.user:", context.user);
    
    // For now, just log and don't redirect to see what's happening
    if (context.user) {
      const user = context.user as any;
      console.log("User found! Onboarding fields:", {
        onboardingStarted: user.onboardingStarted,
        onboardingStep: user.onboardingStep,
        onboardingCompleted: user.onboardingCompleted
      });
      
      const needsOnboarding = user.onboardingCompleted === undefined || !user.onboardingCompleted;
      console.log("Needs onboarding:", needsOnboarding);
      console.log("Should redirect to:", needsOnboarding ? "/onboarding" : "/");
      
      // TODO: Add redirect logic back after we understand what's happening
    } else {
      console.log("No user found in context");
    }
    
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

import { QueryClient } from "@tanstack/react-query";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import authClient from "./auth/auth-client";

import { routeTree } from "./routeTree.gen.js";

export function createRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes
        retry: 1,
      },
    },
  });

  return createTanStackRouter({
    routeTree,
    context: { 
      queryClient, 
      user: null,
      authClient,
    },
    defaultPreload: "intent",
    defaultPreloadStaleTime: 1000 * 60, // 1 minute
    scrollRestoration: true,
    defaultStructuralSharing: true,
    defaultPendingComponent: () => null,
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}

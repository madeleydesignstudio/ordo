// src/routes/__root.tsx
/// <reference types="vite/client" />
import type { ReactNode } from "react";
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SidebarProvider, SidebarTrigger } from "@ordo/ui/components/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { TopNav } from "@/components/top-nav";
import { BottomNav } from "@/components/bottom-nav";
import { MainContent } from "@/components/main-content";
import { FocusProvider } from "@/context/focus-context";

import appCss from "../styles/app.css?url";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "TanStack Start Starter",
      },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <QueryClientProvider client={queryClient}>
        <FocusProvider>
          <SidebarProvider defaultOpen={false}>
            <AppSidebar />
            <TopNav />
            <MainContent>
              <Outlet />
            </MainContent>
            <BottomNav />
          </SidebarProvider>
        </FocusProvider>
      </QueryClientProvider>
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

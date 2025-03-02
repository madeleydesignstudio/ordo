// app/routes/__root.tsx
import type { ReactNode } from "react";
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { SidebarProvider } from "@/components/sidebar-context";
import { AppSidebar } from "@/components/app-sidebar";

import appCss from "@/styles/app.css?url";
import Header from "@/components/header";

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
        title: "Ordo",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <AppLayout>
        <Outlet />
      </AppLayout>
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html>
      <SidebarProvider>
        <head>
          <HeadContent />
        </head>
        <body>
          <Header />
          {children}
          <Scripts />
        </body>
      </SidebarProvider>
    </html>
  );
}

function AppLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <AppSidebar />
      <main>{children}</main>
    </>
  );
}

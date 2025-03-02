// app/routes/__root.tsx
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/sidebar-context";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
  Link,
} from "@tanstack/react-router";
import type { ReactNode } from "react";

import Header from "@/components/header";
import appCss from "@/styles/app.css?url";

function NotFoundComponent() {
  return (
    <RootDocument>
      <Header />
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
          <p className="mt-4">
            Sorry, the page you are looking for does not exist.
          </p>
          <Link
            to="/"
            className="mt-8 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go Home
          </Link>
        </div>
      </AppLayout>
    </RootDocument>
  );
}

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
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "96x96",
        href: "/favicon-96x96.png",
      },
      { rel: "manifest", href: "/site.webmanifest", color: "#fffff" },
      { rel: "icon", href: "/favicon.ico" },
      {
        rel: "stylesheet",
        href: "/fonts/nohemi.css",
      },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <AppLayout>
        <Header />
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

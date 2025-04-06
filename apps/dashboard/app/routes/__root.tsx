// app/routes/__root.tsx

import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
  Link,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import appCss from "@/styles/app.css?url";
import MainContentProvider from "@/components/providers/MainContentProvider";
import { DateProvider } from "@/components/date-context";
import { CommandMenu } from "../components/command-menu/command-menu";

// Configure the QueryClient with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});

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

function AppLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <MainContentProvider>
      <main className="w-full h-full rounded-md">
        {children}
        <div className="w-full max-w-sm">
          <CommandMenu />
        </div>
      </main>
    </MainContentProvider>
  );
}

function NotFoundComponent() {
  return (
    <RootDocument>
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

function RootComponent() {
  return (
    <RootDocument>
      <QueryClientProvider client={queryClient}>
        <DateProvider>
          <AppLayout>
            <Outlet />
          </AppLayout>
        </DateProvider>
      </QueryClientProvider>
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
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

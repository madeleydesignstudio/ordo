// app/routes/__root.tsx

import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
  useMatches
} from "@tanstack/react-router";
import type { ReactNode } from "react";

import { createServerFn } from "@tanstack/react-start";
import { getWebRequest } from "@tanstack/react-start/server";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import { DateProvider } from "@/components/date-context";
import MainContentProvider from "@/components/providers/MainContentProvider";
import appCss from "@/styles/app.css?url";
import { QueryClient } from "@tanstack/react-query";
import { CommandMenu } from "../components/command-menu/command-menu";

import { auth } from "@/lib/server/auth";


const getUser = createServerFn({ method: "GET" }).handler(async () => {
  const { headers } = getWebRequest()!;
  const session = await auth.api.getSession({ headers });

  return session?.user || null;
});

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  user: Awaited<ReturnType<typeof getUser>>;
}>()({
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.fetchQuery({
      queryKey: ["user"],
      queryFn: ({ signal }) => getUser({ signal }),
    }); // we're using react-query for caching, see router.tsx
    return { user };
  },
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
});

function RootComponent() {
  const matches = useMatches();
  const isAuthRoute = matches.some(match => 
    match.pathname === '/login' || 
    match.pathname === '/signup'
  );

  return (
    <RootDocument>
      {isAuthRoute ? (
        <Outlet />
      ) : (
        <AppLayout>
          <Outlet />
        </AppLayout>
      )}
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
        <DateProvider>
          {children}
          <ReactQueryDevtools buttonPosition="bottom-left" />
          <TanStackRouterDevtools position="bottom-right" />
          <div className="w-full max-w-sm">
            <CommandMenu />
          </div>
          <Scripts />
        </DateProvider>
      </body>
    </html>
  );
}

function AppLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <MainContentProvider>
        <main className="w-full h-full rounded-md">{children}</main>
      </MainContentProvider>
    </>
  );
}

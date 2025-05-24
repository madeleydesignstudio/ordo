import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  ScriptOnce,
  Scripts,
  useLocation
} from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getWebRequest } from "@tanstack/react-start/server";

// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
// import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import { DateProvider } from "~/components/date-context";
import MainContentProvider from "~/components/providers/MainContentProvider";
import { auth } from "~/lib/server/auth";
import appCss from "~/lib/styles/app.css?url";

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
    // Only fetch user if not already in context
    if (!context.user) {
      const user = await context.queryClient.fetchQuery({
        queryKey: ["user"],
        queryFn: ({ signal }) => getUser({ signal }),
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
      });
      return { user };
    }
    return { user: context.user };
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
        title: "React TanStarter",
      },
      {
        name: "description",
        content: "A minimal starter template for 🏝️ TanStack Start.",
      },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  component: RootComponent,
});

function RootComponent() {
  const { pathname } = useLocation();
  const isAuthRoute = pathname === '/login' || pathname === '/signup';
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <RootDocument>
      {isAuthRoute ? (
        <Outlet />
      ) : (
        <AppLayout>
          <Outlet />
        </AppLayout>
      )}
      {isDev && (
        <>
          {/* <ReactQueryDevtools buttonPosition="bottom-left" />
          <TanStackRouterDevtools position="bottom-right" /> */}
        </>
      )}
    </RootDocument>
  );
}

function RootDocument({ children }: { readonly children: React.ReactNode }) {
  return (
    // suppress since we're updating the "dark" class in a custom script below
    <html suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <DateProvider>
      <body>
        <ScriptOnce>
          {`document.documentElement.classList.toggle(
            'dark',
            localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
            )`}
        </ScriptOnce>

        {children}

          <Scripts />
        </body>
      </DateProvider>
    </html>
  );
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (      
    <>
      <MainContentProvider>
        <main className="w-full h-full rounded-md">
          {children}
        </main>
      </MainContentProvider>
    </>
  );
}
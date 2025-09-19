// src/routes/__root.tsx
/// <reference types="vite/client" />
import type { ReactNode } from "react";
import { useState, useEffect } from "react";
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PGlite } from "@electric-sql/pglite";
import { live } from "@electric-sql/pglite/live";
import { PGliteProvider } from "@electric-sql/pglite-react";
import type { PGliteWithLive } from "@electric-sql/pglite/live";
import { todoService } from "../lib/todoService";

import appCss from "../styles/app.css?url";

// Create a client
const queryClient = new QueryClient();

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
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  const [db, setDb] = useState<PGliteWithLive | null>(null);

  useEffect(() => {
    async function initDb() {
      try {
        const database = await PGlite.create({
          dataDir: "idb://ordo-db",
          extensions: { live },
        });
        setDb(database);
        todoService.setDatabase(database);
        await todoService.initialize();
        console.log("✅ PGLite initialized successfully");
      } catch (error) {
        console.error("❌ Failed to initialize PGLite:", error);
      }
    }
    initDb();
  }, []);

  if (!db) {
    return (
      <html>
        <head>
          <HeadContent />
        </head>
        <body>
          <div style={{ padding: "20px", textAlign: "center" }}>
            Loading database...
          </div>
          <Scripts />
        </body>
      </html>
    );
  }

  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <PGliteProvider db={db}>
            {children}
            <Scripts />
          </PGliteProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}

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
import { PGlite } from "@electric-sql/pglite";
import { live } from "@electric-sql/pglite/live";
import { PGliteProvider } from "@electric-sql/pglite-react";
import type { PGliteWithLive } from "@electric-sql/pglite/live";

import appCss from "../styles/app.css?url";

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
      const database = await PGlite.create({
        dataDir: "idb://my-app-db",
        extensions: { live },
      });
      setDb(database);
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
          <div>Loading database...</div>
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
        <PGliteProvider db={db}>
          {children}
          <Scripts />
        </PGliteProvider>
      </body>
    </html>
  );
}

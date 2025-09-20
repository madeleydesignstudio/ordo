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
import PWAUpdatePrompt from "../components/PWAUpdatePrompt";

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
        title: "Ordo Todo App - Offline First",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "icon", href: "/icon.svg", type: "image/svg+xml" },
    ],
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
  const [isOnline, setIsOnline] = useState(true); // Default to true to avoid hydration mismatch

  // Online/offline detection
  useEffect(() => {
    if (typeof navigator !== "undefined") {
      // Set initial state after hydration
      setIsOnline(navigator.onLine);

      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

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
            {!isOnline && (
              <div
                style={{
                  background: "#ff9800",
                  color: "white",
                  padding: "8px",
                  marginBottom: "10px",
                  borderRadius: "4px",
                }}
              >
                📱 Offline Mode - Loading from cache...
              </div>
            )}
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
            {!isOnline && (
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  background: "#4caf50",
                  color: "white",
                  padding: "8px",
                  textAlign: "center",
                  zIndex: 1000,
                }}
              >
                📱 Offline Mode - App fully functional!
              </div>
            )}
            <div style={{ paddingTop: !isOnline ? "40px" : "0" }}>
              {children}
              <PWAUpdatePrompt />
            </div>
            <Scripts />
          </PGliteProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}

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

const queryClient = new QueryClient();
const DATABASE_NAME = "idb://ordo-db";

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

  useEffect(() => {
    const setupOnlineDetection = () => {
      if (typeof navigator === "undefined") return;

      setIsOnline(navigator.onLine);

      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    };

    return setupOnlineDetection();
  }, []);

  useEffect(() => {
    const initializeDatabase = async (): Promise<void> => {
      try {
        const database = await PGlite.create({
          dataDir: DATABASE_NAME,
          extensions: { live },
        });

        setDb(database);
        todoService.setDatabase(database);
        await todoService.initialize();
      } catch (error) {
        console.error("Failed to initialize PGLite:", error);
        // TODO: Add user-friendly error handling
      }
    };

    initializeDatabase();
  }, []);

  if (!db) {
    return (
      <html>
        <head>
          <HeadContent />
        </head>
        <body>
          <LoadingScreen isOnline={isOnline} />
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
            <OfflineBanner isOnline={isOnline} />
            <MainContent isOnline={isOnline}>
              {children}
              <PWAUpdatePrompt />
            </MainContent>
            <Scripts />
          </PGliteProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}

interface LoadingScreenProps {
  isOnline: boolean;
}

function LoadingScreen({ isOnline }: LoadingScreenProps) {
  return (
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
  );
}

interface OfflineBannerProps {
  isOnline: boolean;
}

function OfflineBanner({ isOnline }: OfflineBannerProps) {
  if (isOnline) return null;

  return (
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
  );
}

interface MainContentProps {
  isOnline: boolean;
  children: ReactNode;
}

function MainContent({ isOnline, children }: MainContentProps) {
  return <div style={{ paddingTop: !isOnline ? "40px" : "0" }}>{children}</div>;
}

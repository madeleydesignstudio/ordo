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
import UpdateNotification from "../components/UpdateNotification";
import UpdateStatusIndicator from "../components/UpdateStatusIndicator";

import appCss from "../styles/app.css?url";

// Build timestamp for version checking
declare const __BUILD_TIMESTAMP__: number;

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
  const [dbError, setDbError] = useState<string | null>(null);
  const [isOfflineFirstLaunch, setIsOfflineFirstLaunch] = useState(false);

  useEffect(() => {
    const setupOnlineDetection = () => {
      if (typeof navigator === "undefined") return;

      const currentlyOnline = navigator.onLine;
      setIsOnline(currentlyOnline);

      // Detect if this is an offline-first launch
      if (!currentlyOnline) {
        setIsOfflineFirstLaunch(true);
        console.log(
          "🚫 OFFLINE-FIRST LAUNCH: App starting without internet connection",
        );
        console.log(
          "✅ This is exactly what offline-first means - the app works!",
        );
      } else {
        console.log("🌐 Online launch detected");
      }

      const handleOnline = () => {
        setIsOnline(true);
        if (isOfflineFirstLaunch) {
          console.log(
            "🌐 Internet connection restored after offline-first launch",
          );
          setTimeout(() => setIsOfflineFirstLaunch(false), 5000);
        }
      };
      const handleOffline = () => {
        setIsOnline(false);
        console.log("📴 Going offline - app continues to work normally");
      };

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    };

    return setupOnlineDetection();
  }, [isOfflineFirstLaunch]);

  useEffect(() => {
    const initializeDatabase = async (): Promise<void> => {
      try {
        console.log("🔄 Initializing PGLite database...");

        const database = await PGlite.create({
          dataDir: DATABASE_NAME,
          extensions: { live },
        });

        console.log("✅ PGLite database created successfully");
        setDb(database);
        todoService.setDatabase(database);
        await todoService.initialize();
        console.log("✅ Todo service initialized");

        // Clear any previous errors
        setDbError(null);
      } catch (error) {
        console.error("❌ Failed to initialize PGLite:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown database error";
        setDbError(errorMessage);

        // Don't prevent the app from loading - show error state instead
        console.log("⚠️ App will continue without database functionality");
      }
    };

    // Add a small delay to ensure the app doesn't block on database initialization
    const timeoutId = setTimeout(initializeDatabase, 100);

    return () => clearTimeout(timeoutId);
  }, []);

  if (!db && !dbError) {
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

  // Show error state but still render the app
  if (dbError && !db) {
    return (
      <html>
        <head>
          <HeadContent />
        </head>
        <body>
          <QueryClientProvider client={queryClient}>
            <OfflineBanner isOnline={isOnline} />
            <DatabaseErrorBanner error={dbError} />
            <MainContent isOnline={isOnline}>
              <div style={{ padding: "20px", textAlign: "center" }}>
                <h2>⚠️ Database Unavailable</h2>
                <p>The app is running but database features are disabled.</p>
                <p style={{ fontSize: "12px", color: "#666" }}>
                  Error: {dbError}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  style={{
                    padding: "8px 16px",
                    background: "#4F46E5",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    marginTop: "16px",
                  }}
                >
                  Retry
                </button>
              </div>
              <UpdateNotification />
              <UpdateStatusIndicator />
            </MainContent>
            <Scripts />
          </QueryClientProvider>
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
          <PGliteProvider db={db!}>
            <OfflineBanner isOnline={isOnline} />
            <OfflineFirstBanner
              isOfflineFirstLaunch={isOfflineFirstLaunch}
              isOnline={isOnline}
            />
            <MainContent
              isOnline={isOnline}
              isOfflineFirstLaunch={isOfflineFirstLaunch}
            >
              {children}
              <UpdateNotification />
              <UpdateStatusIndicator />
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

interface OfflineFirstBannerProps {
  isOfflineFirstLaunch: boolean;
  isOnline: boolean;
}

function OfflineFirstBanner({
  isOfflineFirstLaunch,
  isOnline,
}: OfflineFirstBannerProps) {
  if (!isOfflineFirstLaunch) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: isOnline ? "0" : "40px",
        left: 0,
        right: 0,
        background: "#4F46E5",
        color: "white",
        padding: "8px 12px",
        textAlign: "center",
        zIndex: 999,
        fontSize: "14px",
        fontWeight: "bold",
      }}
    >
      🎉 OFFLINE-FIRST SUCCESS! App launched without internet & works perfectly!
      {isOnline && " 🌐 Now online - sync available"}
    </div>
  );
}

interface MainContentProps {
  isOnline: boolean;
  isOfflineFirstLaunch: boolean;
  children: ReactNode;
}

function MainContent({
  isOnline,
  isOfflineFirstLaunch,
  children,
}: MainContentProps) {
  const topPadding = (!isOnline ? 40 : 0) + (isOfflineFirstLaunch ? 40 : 0);
  return <div style={{ paddingTop: `${topPadding}px` }}>{children}</div>;
}

interface DatabaseErrorBannerProps {
  error: string;
}

function DatabaseErrorBanner({ error }: DatabaseErrorBannerProps) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        background: "#ff9800",
        color: "white",
        padding: "8px",
        textAlign: "center",
        zIndex: 1001,
        fontSize: "14px",
      }}
    >
      ⚠️ Database Error: App running in limited mode
    </div>
  );
}

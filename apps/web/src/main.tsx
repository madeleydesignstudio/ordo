import { PGlite } from "@electric-sql/pglite";
import { live } from "@electric-sql/pglite/live";
import { electricSync } from "@electric-sql/pglite-sync";
import { PGliteProvider } from "@electric-sql/pglite-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

// PWA Install prompt event interface
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// PWA Install prompt state
let deferredPrompt: BeforeInstallPromptEvent | null = null;

// Register service worker for PWA with better offline handling
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        // Listen for updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                // New content is available, prompt user to refresh
                if (confirm("New version available! Refresh to update?")) {
                  window.location.reload();
                }
              }
            });
          }
        });
      })
      .catch(() => {});
  });

  // Listen for offline/online status
  window.addEventListener("online", () => {
    document.body.classList.remove("offline");
  });

  window.addEventListener("offline", () => {
    document.body.classList.add("offline");
  });

  // Listen for PWA install prompt
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    showInstallButton();
  });

  // Listen for PWA installation
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    hideInstallButton();
  });
}

// Show PWA install button
function showInstallButton() {
  if (document.querySelector(".pwa-install-prompt")) return;

  const installButton = document.createElement("button");
  installButton.className = "pwa-install-prompt";
  installButton.innerHTML = "📱 Install App";
  installButton.onclick = installPWA;
  document.body.appendChild(installButton);
}

// Hide PWA install button
function hideInstallButton() {
  const installButton = document.querySelector(".pwa-install-prompt");
  if (installButton) {
    installButton.remove();
  }
}

// Install PWA
async function installPWA() {
  if (!deferredPrompt) return;

  const installButton = document.querySelector(".pwa-install-prompt");
  if (installButton) {
    installButton.innerHTML = "⏳ Installing...";
    installButton.setAttribute("disabled", "true");
  }

  try {
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
  } catch (error) {
    console.error("PWA: Install failed", error);
  }

  deferredPrompt = null;
  hideInstallButton();
}

// Initialize app with PGlite database
async function initApp() {
  try {
    // Request persistent storage to prevent data loss
    if ("storage" in navigator && "persist" in navigator.storage) {
      await navigator.storage.persist();
    }

    // Create PGlite instance with live queries support, ElectricSQL sync, and persistent storage
    const db = await PGlite.create("idb://ordo-db", {
      extensions: {
        live,
        electric: electricSync({
          metadataSchema: "electric",
          debug: import.meta.env.DEV || false,
        }),
      },
    });

    // Create QueryClient for TanStack Query
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 30 * 1000, // 30 seconds default
          refetchOnWindowFocus: true, // Enable focus refetching for real-time feel
          refetchOnReconnect: true, // Refetch when reconnecting
        },
      },
    });

    createRoot(document.getElementById("root") as HTMLElement).render(
      <StrictMode>
        <QueryClientProvider client={queryClient}>
          <PGliteProvider db={db}>
            <App />
          </PGliteProvider>
        </QueryClientProvider>
      </StrictMode>
    );
  } catch (error) {
    console.error("Failed to initialize app:", error);

    // Show error message directly in DOM
    const root = document.getElementById("root");
    if (root) {
      root.innerHTML = `
        <div style="padding: 20px; max-width: 600px; margin: 40px auto; font-family: system-ui, sans-serif;">
          <h1 style="color: #c33;">⚠️ App Failed to Load</h1>
          <p>The application couldn't initialize properly.</p>
          <details style="margin: 20px 0;">
            <summary style="cursor: pointer; font-weight: bold;">Error Details</summary>
            <pre style="background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 4px; overflow: auto; font-size: 12px;">${error instanceof Error ? `${error.message}\n\n${error.stack}` : String(error)}</pre>
          </details>
          <button type="button" onclick="window.location.reload()" style="padding: 10px 20px; background: #007cba; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;">
            Reload Page
          </button>
          <button type="button" onclick="
            if ('indexedDB' in window) indexedDB.deleteDatabase('ordo-db');
            localStorage.clear();
            sessionStorage.clear();
            window.location.reload();
          " style="padding: 10px 20px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Reset & Reload
          </button>
        </div>
      `;
    }
  }
}

initApp();

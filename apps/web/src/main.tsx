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
    // ElectricSQL handles real-time sync from cloud to PGlite automatically
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: Infinity, // Never consider data stale - ElectricSQL callbacks handle invalidation
          refetchOnWindowFocus: true, // Refetch when switching back to tab
          refetchOnReconnect: true, // Refetch when internet reconnects
          // No refetchInterval needed - ElectricSQL automatically syncs changes to PGlite
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
      </StrictMode>,
    );
  } catch (error) {
    console.error("Failed to initialize app:", error);

    // Show error UI
    const errorDiv = document.createElement("div");
    errorDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      text-align: center;
      font-family: Arial, sans-serif;
      max-width: 400px;
      z-index: 9999;
    `;

    errorDiv.innerHTML = `
      <h2 style="color: #d32f2f; margin: 0 0 16px 0;">❌ App Failed to Start</h2>
      <p style="margin: 0 0 16px 0; color: #666;">
        ${error instanceof Error ? error.message : String(error)}
      </p>
      <button onclick="window.location.reload()" style="
        background: #1976d2;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
      ">Reload Page</button>
    `;

    document.body.appendChild(errorDiv);
  }
}

// Start the app
initApp();

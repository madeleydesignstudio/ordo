import { PGlite } from "@electric-sql/pglite";
import { live } from "@electric-sql/pglite/live";
import { PGliteProvider } from "@electric-sql/pglite-react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

// Register service worker for PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then(() => console.log("PWA: Service worker registered"))
      .catch(() => console.log("PWA: Service worker registration failed"));
  });
}

// Initialize app with PGlite database
async function initApp() {
  try {
    console.log("Initializing Ordo app...");

    // Create PGlite instance with live queries support and persistent storage
    console.log("Creating PGlite database...");
    const db = await PGlite.create("idb://ordo-db", {
      extensions: { live },
    });

    console.log("Database created successfully, rendering app...");

    createRoot(document.getElementById("root") as HTMLElement).render(
      <StrictMode>
        <PGliteProvider db={db}>
          <App />
        </PGliteProvider>
      </StrictMode>,
    );

    console.log("App rendered successfully");
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
            <pre style="background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 4px; overflow: auto; font-size: 12px;">${error instanceof Error ? error.message + "\n\n" + error.stack : String(error)}</pre>
          </details>
          <button onclick="window.location.reload()" style="padding: 10px 20px; background: #007cba; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;">
            Reload Page
          </button>
          <button onclick="
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

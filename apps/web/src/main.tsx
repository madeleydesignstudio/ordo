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
  // Create PGlite instance with live queries support and persistent storage
  const db = await PGlite.create("idb://ordo-db", {
    extensions: { live },
  });

  createRoot(document.getElementById("root") as HTMLElement).render(
    <StrictMode>
      <PGliteProvider db={db}>
        <App />
      </PGliteProvider>
    </StrictMode>,
  );
}

initApp().catch(console.error);

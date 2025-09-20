import React, { useState, useEffect } from "react";

interface PWAUpdatePromptProps {}

function PWAUpdatePrompt({}: PWAUpdatePromptProps) {
  const [offlineReady, setOfflineReady] = useState(false);
  const [needRefresh, setNeedRefresh] = useState(false);
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((reg) => {
          console.log("✅ SW Registered:", reg);
          setRegistration(reg);

          // Check if there's a waiting service worker
          if (reg.waiting) {
            setNeedRefresh(true);
          }

          // Listen for updates
          reg.addEventListener("updatefound", () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed") {
                  if (navigator.serviceWorker.controller) {
                    // New update available
                    setNeedRefresh(true);
                  } else {
                    // App is ready for offline use
                    setOfflineReady(true);
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.log("❌ SW registration failed:", error);
        });

      // Listen for controlling service worker changes
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        window.location.reload();
      });

      // Check if app is ready for offline use
      if (navigator.serviceWorker.controller) {
        setOfflineReady(true);
      }
    }
  }, []);

  const updateServiceWorker = async () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
    }
  };

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  return (
    <div style={{ position: "fixed", zIndex: 1000 }}>
      {(offlineReady || needRefresh) && (
        <div
          style={{
            position: "fixed",
            right: "16px",
            bottom: "16px",
            padding: "12px 16px",
            background: "#4F46E5",
            color: "white",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            maxWidth: "300px",
          }}
        >
          <div>
            {offlineReady && !needRefresh ? (
              <span>🎉 App ready to work offline!</span>
            ) : (
              <span>🔄 New content available!</span>
            )}
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {needRefresh && (
              <button
                onClick={updateServiceWorker}
                style={{
                  background: "white",
                  color: "#4F46E5",
                  border: "none",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                Update
              </button>
            )}
            <button
              onClick={close}
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                color: "white",
                border: "none",
                padding: "4px 8px",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PWAUpdatePrompt;

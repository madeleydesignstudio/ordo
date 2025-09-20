import React, { useState, useEffect } from "react";

interface PWAUpdatePromptProps {}

function PWAUpdatePrompt({}: PWAUpdatePromptProps) {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      // Listen for PWA events from vite-plugin-pwa
      window.addEventListener("vite:pwa-update", (event: any) => {
        if (event.detail) {
          setNeedRefresh(true);
        }
      });

      // Check for existing service worker
      navigator.serviceWorker.ready.then(() => {
        setOfflineReady(true);
      });

      // Listen for service worker updates
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (needRefresh) {
          window.location.reload();
        }
      });
    }
  }, [needRefresh]);

  const updateApp = () => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg && reg.waiting) {
          reg.waiting.postMessage({ type: "SKIP_WAITING" });
          setNeedRefresh(false);
        }
      });
    }
  };

  const dismiss = () => {
    setNeedRefresh(false);
  };

  return (
    <>
      {offlineReady && !needRefresh && (
        <div
          style={{
            position: "fixed",
            bottom: "16px",
            left: "16px",
            padding: "8px 12px",
            background: "#4caf50",
            color: "white",
            borderRadius: "4px",
            fontSize: "12px",
            zIndex: 1000,
          }}
        >
          ✓ Ready to work offline
        </div>
      )}

      {needRefresh && (
        <div
          style={{
            position: "fixed",
            top: "16px",
            right: "16px",
            padding: "16px",
            background: "#4F46E5",
            color: "white",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            zIndex: 10000,
            maxWidth: "320px",
          }}
        >
          <div style={{ marginBottom: "12px" }}>
            <strong>🚀 New version available!</strong>
            <br />
            <small>Refresh to get the latest features</small>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={updateApp}
              style={{
                background: "white",
                color: "#4F46E5",
                border: "none",
                padding: "8px 16px",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              Refresh Now
            </button>
            <button
              onClick={dismiss}
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                color: "white",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                padding: "8px 12px",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Later
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default PWAUpdatePrompt;

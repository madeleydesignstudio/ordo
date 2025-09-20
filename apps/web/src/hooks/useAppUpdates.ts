import { useState, useEffect, useCallback } from "react";
import {
  mobileUpdateHelper,
  isMobileDevice,
  isPWAInstalled,
} from "../utils/mobileUpdateHelper";

interface VersionInfo {
  version: string;
  timestamp: number;
  updated: string;
}

interface UseAppUpdatesReturn {
  showUpdatePrompt: boolean;
  updateType: "deployment" | "pwa" | null;
  isChecking: boolean;
  forceRefresh: () => void;
  handleUpdate: () => Promise<void>;
  dismissUpdate: () => void;
}

export function useAppUpdates(): UseAppUpdatesReturn {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [updateType, setUpdateType] = useState<"deployment" | "pwa" | null>(
    null,
  );
  const [isChecking, setIsChecking] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Use mobile helper for device detection
  const isMobile = useCallback(() => {
    if (typeof navigator === "undefined") return false;
    return isMobileDevice();
  }, []);

  const isPWA = useCallback(() => {
    if (typeof window === "undefined") return false;
    return isPWAInstalled();
  }, []);

  // Enhanced force refresh with mobile-optimized cache clearing
  const forceRefresh = useCallback(async () => {
    console.log("🔄 Starting cache clear and refresh...");

    try {
      // Clear all caches but preserve user data
      if ("caches" in window) {
        console.log("🗑️ Clearing cache storage...");
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(async (name) => {
            console.log(`Deleting cache: ${name}`);
            return caches.delete(name);
          }),
        );
      }

      // Clear and restore essential data
      const preserveKeys = ["pglite-data", "user-preferences", "app_version"];
      const preservedData: Record<string, string> = {};
      preserveKeys.forEach((key) => {
        const value = localStorage.getItem(key);
        if (value) preservedData[key] = value;
      });

      localStorage.clear();
      sessionStorage.clear();

      Object.entries(preservedData).forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });

      // Perform refresh with cache busting
      const timestamp = Date.now();
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set("v", timestamp.toString());
      currentUrl.searchParams.set("cb", Math.random().toString(36));

      window.location.href = currentUrl.toString();
    } catch (error) {
      console.error("❌ Error during cache clear:", error);
      // Fallback: simple reload
      window.location.reload();
    }
  }, []);

  // Completely disabled deployment update check for offline-first operation
  const checkForDeploymentUpdate = useCallback(async () => {
    if (isDismissed) return;

    // OFFLINE-FIRST: Never check for updates automatically
    // This prevents any network dependencies on startup
    console.log("🚫 Update checking disabled for offline-first operation");

    // Only store initial version from build timestamp if never set
    if (!localStorage.getItem("app_version")) {
      try {
        if (typeof (globalThis as any).__BUILD_TIMESTAMP__ !== "undefined") {
          const currentVersion = (
            globalThis as any
          ).__BUILD_TIMESTAMP__.toString();
          localStorage.setItem("app_version", currentVersion);
          console.log("📦 Stored initial version from build timestamp");
        }
      } catch (error) {
        console.warn("Failed to store build timestamp:", error);
      }
    }
  }, [isDismissed]);

  // Handle updates with offline-safe logic
  const handleUpdate = useCallback(async () => {
    if (updateType === "deployment") {
      console.log("🔄 Handling deployment update...");
      forceRefresh();
    } else if (updateType === "pwa") {
      console.log("🔄 Handling PWA update...");
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration && registration.waiting) {
          registration.waiting.postMessage({ type: "SKIP_WAITING" });

          // Wait for controller change or timeout
          setTimeout(() => {
            if (showUpdatePrompt) {
              console.log("⏱️ PWA update timeout, forcing refresh...");
              forceRefresh();
            }
          }, 3000);

          setShowUpdatePrompt(false);
        } else {
          // No waiting SW, force refresh
          forceRefresh();
        }
      } else {
        forceRefresh();
      }
    }
  }, [updateType, forceRefresh, showUpdatePrompt]);

  // Dismiss update
  const dismissUpdate = useCallback(() => {
    setShowUpdatePrompt(false);
    setIsDismissed(true);

    // Allow checking again after 5 minutes
    setTimeout(
      () => {
        setIsDismissed(false);
      },
      5 * 60 * 1000,
    );
  }, []);

  // Handle PWA service worker updates
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      // Listen for PWA update events from vite-plugin-pwa
      const handlePWAUpdate = (event: CustomEvent) => {
        console.log("PWA update available");
        if (!isDismissed) {
          setUpdateType("pwa");
          setShowUpdatePrompt(true);
        }
      };

      window.addEventListener(
        "vite:pwa-update",
        handlePWAUpdate as EventListener,
      );

      // Enhanced service worker controller change handling
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        console.log("Service Worker controller changed");
        if (showUpdatePrompt && updateType === "pwa") {
          // Small delay to ensure SW is fully active
          setTimeout(() => {
            window.location.reload();
          }, 100);
        }
      });

      // Listen for SW messages (mobile PWAs need this)
      navigator.serviceWorker.addEventListener("message", (event) => {
        console.log("SW message:", event.data);
        if (event.data && event.data.type === "CACHE_UPDATED") {
          if (!isDismissed) {
            setUpdateType("pwa");
            setShowUpdatePrompt(true);
          }
        }
      });

      return () => {
        window.removeEventListener(
          "vite:pwa-update",
          handlePWAUpdate as EventListener,
        );
      };
    }
  }, [showUpdatePrompt, updateType, isDismissed]);

  // OFFLINE-FIRST: Completely disable automatic update checking
  useEffect(() => {
    // Only initialize version on first load, no network calls
    checkForDeploymentUpdate();

    console.log(
      "🚫 Automatic update checking disabled for offline-first operation",
    );
    console.log(
      "💡 To check for updates manually, user must explicitly request it",
    );

    // No automatic periodic checks, no network event listeners
    // This ensures the app works completely offline
  }, [checkForDeploymentUpdate]);

  return {
    showUpdatePrompt,
    updateType,
    isChecking,
    forceRefresh,
    handleUpdate,
    dismissUpdate,
  };
}

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

  // Offline-friendly deployment update check
  const checkForDeploymentUpdate = useCallback(async () => {
    if (isDismissed) return;

    // Skip version checks if offline
    if (!navigator.onLine) {
      console.log("📴 Offline - skipping version check");
      return;
    }

    try {
      setIsChecking(true);

      const cacheBuster = Date.now();
      const random = Math.random().toString(36).substring(2);

      // Shorter timeout to avoid blocking offline usage
      const response = await fetch(
        `/version.json?t=${cacheBuster}&r=${random}`,
        {
          method: "GET",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
          cache: "no-store",
          signal: AbortSignal.timeout(5000), // Reduced timeout
        },
      );

      if (!response.ok) {
        console.warn("Could not fetch version info:", response.status);
        return;
      }

      const serverVersion: VersionInfo = await response.json();
      const storedVersion = localStorage.getItem("app_version");

      console.log("Version check:", {
        stored: storedVersion,
        server: serverVersion.version,
        online: navigator.onLine,
      });

      if (storedVersion && serverVersion.version !== storedVersion) {
        console.log("🚀 New deployment detected:", {
          stored: storedVersion,
          server: serverVersion.version,
        });

        localStorage.setItem("app_version", serverVersion.version);
        setUpdateType("deployment");
        setShowUpdatePrompt(true);
      } else if (!storedVersion) {
        localStorage.setItem("app_version", serverVersion.version);
        localStorage.setItem("last_version_check", Date.now().toString());
      }
    } catch (error) {
      console.warn("Version check failed (continuing offline):", error);

      // Only do fallback check if we've never stored a version
      if (!localStorage.getItem("app_version")) {
        try {
          if (typeof (globalThis as any).__BUILD_TIMESTAMP__ !== "undefined") {
            const currentVersion = (
              globalThis as any
            ).__BUILD_TIMESTAMP__.toString();
            localStorage.setItem("app_version", currentVersion);
            console.log("📦 Stored initial version from build timestamp");
          }
        } catch (fallbackError) {
          console.warn("Fallback version storage failed:", fallbackError);
        }
      }
    } finally {
      setIsChecking(false);
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

  // Offline-friendly periodic deployment checks
  useEffect(() => {
    // Skip update checks on initial load to allow offline startup
    const initialTimeout = setTimeout(() => {
      if (navigator.onLine) {
        checkForDeploymentUpdate();
      }
    }, 5000); // Longer delay to let app initialize offline

    // Less aggressive checking to avoid blocking offline usage
    const checkInterval = 60000; // Check every minute when online
    const interval = setInterval(() => {
      if (navigator.onLine) {
        checkForDeploymentUpdate();
      }
    }, checkInterval);

    // Event listeners for when app becomes active
    const handleVisibilityChange = () => {
      if (!document.hidden && navigator.onLine) {
        console.log("🔍 Tab visible and online, checking for updates...");
        setTimeout(checkForDeploymentUpdate, 1000);
      }
    };

    const handleFocus = () => {
      if (navigator.onLine) {
        console.log("🔍 Window focused and online, checking for updates...");
        setTimeout(checkForDeploymentUpdate, 1000);
      }
    };

    const handleOnline = () => {
      console.log("🌐 Back online, checking for updates...");
      setTimeout(checkForDeploymentUpdate, 2000);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("online", handleOnline);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("online", handleOnline);
    };
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

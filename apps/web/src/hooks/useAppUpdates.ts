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
    console.log("🔄 Starting mobile-optimized cache clear and refresh...");

    try {
      if (isMobile()) {
        // Use mobile helper for comprehensive cache clearing
        await mobileUpdateHelper.performMobileRefresh({
          aggressive: true,
          preserveUserData: true,
          timeout: 15000,
        });
      } else {
        // Desktop fallback - use original logic
        if ("caches" in window) {
          console.log("🗑️ Clearing all cache storage...");
          const cacheNames = await caches.keys();
          await Promise.all(
            cacheNames.map(async (name) => {
              console.log(`Deleting cache: ${name}`);
              return caches.delete(name);
            }),
          );
        }

        if ("serviceWorker" in navigator) {
          console.log("🔧 Unregistering all service workers...");
          const registrations =
            await navigator.serviceWorker.getRegistrations();
          await Promise.all(
            registrations.map(async (registration) => {
              console.log("Unregistering SW:", registration.scope);
              return registration.unregister();
            }),
          );
        }

        // Clear and restore essential data
        const preserveKeys = ["pglite-data", "user-preferences"];
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

        // Perform standard refresh
        const timestamp = Date.now();
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set("v", timestamp.toString());
        currentUrl.searchParams.set("cb", Math.random().toString(36));

        window.location.href = currentUrl.toString();
      }
    } catch (error) {
      console.error("❌ Error during cache clear:", error);
      // Fallback: simple reload with cache busting
      const fallbackUrl = `${window.location.origin}${window.location.pathname}?t=${Date.now()}&r=${Math.random()}`;
      window.location.href = fallbackUrl;
    }
  }, [isMobile]);

  // Mobile-optimized deployment update check
  const checkForDeploymentUpdate = useCallback(async () => {
    if (isDismissed) return;

    try {
      setIsChecking(true);

      if (isMobile()) {
        // Use mobile helper for optimized checking
        const result =
          await mobileUpdateHelper.checkForMobileUpdate("/version.json");

        if (result.hasUpdate && result.serverVersion) {
          console.log("🚀 Mobile update detected:", result);
          localStorage.setItem("app_version", result.serverVersion);
          setUpdateType("deployment");
          setShowUpdatePrompt(true);
        } else if (result.error) {
          console.warn("Mobile update check failed:", result.error);
        }
      } else {
        // Desktop version check
        const cacheBuster = Date.now();
        const random = Math.random().toString(36).substring(2);

        const response = await fetch(
          `/version.json?t=${cacheBuster}&r=${random}&cb=${Date.now()}`,
          {
            method: "GET",
            headers: {
              "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
              Pragma: "no-cache",
              Expires: "-1",
            },
            cache: "no-store",
            signal: AbortSignal.timeout(10000),
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
          mobile: false,
          pwa: isPWA(),
        });

        if (storedVersion && serverVersion.version !== storedVersion) {
          console.log("🚀 New deployment detected:", {
            stored: storedVersion,
            server: serverVersion.version,
            device: "desktop",
          });

          setUpdateType("deployment");
          setShowUpdatePrompt(true);
        } else if (!storedVersion) {
          localStorage.setItem("app_version", serverVersion.version);
          localStorage.setItem("last_version_check", Date.now().toString());
        }
      }
    } catch (error) {
      console.warn("Version check failed:", error);

      // Fallback to build timestamp check
      try {
        if (typeof (globalThis as any).__BUILD_TIMESTAMP__ !== "undefined") {
          const lastVersion = localStorage.getItem("app_version");
          const currentVersion = (
            globalThis as any
          ).__BUILD_TIMESTAMP__.toString();

          if (lastVersion && lastVersion !== currentVersion) {
            console.log("📱 Fallback version check triggered update");
            localStorage.setItem("app_version", currentVersion);
            setUpdateType("deployment");
            setShowUpdatePrompt(true);
          } else if (!lastVersion) {
            localStorage.setItem("app_version", currentVersion);
          }
        }
      } catch (fallbackError) {
        console.warn("Fallback version check failed:", fallbackError);
      }
    } finally {
      setIsChecking(false);
    }
  }, [isDismissed, isMobile, isPWA]);

  // Handle updates with mobile-specific logic
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

          // For mobile, wait a bit then force refresh if needed
          if (isMobile()) {
            setTimeout(
              () => {
                if (showUpdatePrompt) {
                  console.log("📱 PWA update timeout, forcing refresh...");
                  forceRefresh();
                }
              },
              isMobile() ? 5000 : 3000,
            );
          }

          setShowUpdatePrompt(false);
        } else {
          // No waiting SW, force refresh
          forceRefresh();
        }
      } else {
        forceRefresh();
      }
    }
  }, [updateType, forceRefresh, showUpdatePrompt, isMobile]);

  // Dismiss update with shorter timeout on mobile
  const dismissUpdate = useCallback(() => {
    setShowUpdatePrompt(false);
    setIsDismissed(true);

    // Shorter timeout on mobile (users expect faster updates)
    const timeoutDuration = isMobile() ? 3 * 60 * 1000 : 5 * 60 * 1000; // 3min mobile, 5min desktop

    setTimeout(() => {
      setIsDismissed(false);
    }, timeoutDuration);
  }, [isMobile]);

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

  // Enhanced periodic deployment checks with mobile optimizations
  useEffect(() => {
    // Initial check with delay to avoid interfering with app startup
    const initialTimeout = setTimeout(() => {
      checkForDeploymentUpdate();
    }, 2000);

    // More frequent checks on mobile (mobile users expect faster updates)
    const checkInterval = isMobile() ? 20000 : 30000; // 20s mobile, 30s desktop
    const interval = setInterval(checkForDeploymentUpdate, checkInterval);

    // Use mobile helper for enhanced event handling
    const cleanupListeners = isMobile()
      ? mobileUpdateHelper.setupMobileUpdateListeners(checkForDeploymentUpdate)
      : null;

    // Standard desktop event listeners
    if (!isMobile()) {
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          console.log("🔍 Tab became visible, checking for updates...");
          setTimeout(checkForDeploymentUpdate, 500);
        }
      };

      const handleFocus = () => {
        console.log("🔍 Window focused, checking for updates...");
        setTimeout(checkForDeploymentUpdate, 500);
      };

      const handleOnline = () => {
        console.log("🌐 Back online, checking for updates...");
        setTimeout(checkForDeploymentUpdate, 1000);
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);
      window.addEventListener("focus", handleFocus);
      window.addEventListener("online", handleOnline);

      return () => {
        clearTimeout(initialTimeout);
        clearInterval(interval);
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange,
        );
        window.removeEventListener("focus", handleFocus);
        window.removeEventListener("online", handleOnline);
      };
    }

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
      if (cleanupListeners) {
        cleanupListeners();
      }
    };
  }, [checkForDeploymentUpdate, isMobile]);

  return {
    showUpdatePrompt,
    updateType,
    isChecking,
    forceRefresh,
    handleUpdate,
    dismissUpdate,
  };
}

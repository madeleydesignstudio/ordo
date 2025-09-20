import { useState, useEffect, useCallback } from 'react';

interface VersionInfo {
  version: string;
  timestamp: number;
  updated: string;
}

interface UseAppUpdatesReturn {
  showUpdatePrompt: boolean;
  updateType: 'deployment' | 'pwa' | null;
  isChecking: boolean;
  forceRefresh: () => void;
  handleUpdate: () => Promise<void>;
  dismissUpdate: () => void;
}

export function useAppUpdates(): UseAppUpdatesReturn {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [updateType, setUpdateType] = useState<'deployment' | 'pwa' | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Force refresh with cache clearing
  const forceRefresh = useCallback(() => {
    const performHardRefresh = () => {
      // Multiple cache-busting strategies
      const timestamp = Date.now();
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('v', timestamp.toString());
      currentUrl.searchParams.set('cb', Math.random().toString(36));

      // Clear localStorage version info to force re-check
      localStorage.removeItem('app_version');
      localStorage.removeItem('last_version_check');

      // Perform hard refresh
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          registrations.forEach(registration => registration.unregister());
          window.location.href = currentUrl.toString();
        });
      } else {
        window.location.href = currentUrl.toString();
      }
    };

    // Clear all possible caches
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        Promise.all(cacheNames.map(name => caches.delete(name))).then(() => {
          performHardRefresh();
        });
      });
    } else {
      performHardRefresh();
    }
  }, []);

  // Check for deployment updates by comparing version.json
  const checkForDeploymentUpdate = useCallback(async () => {
    if (isDismissed) return;

    try {
      setIsChecking(true);

      // Add cache-busting parameters
      const cacheBuster = Date.now();
      const response = await fetch(`/version.json?t=${cacheBuster}&r=${Math.random()}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        console.warn('Could not fetch version info');
        return;
      }

      const serverVersion: VersionInfo = await response.json();
      const storedVersion = localStorage.getItem('app_version');

      // Compare versions
      if (storedVersion && serverVersion.version !== storedVersion) {
        console.log('New deployment detected:', {
          stored: storedVersion,
          server: serverVersion.version
        });

        setUpdateType('deployment');
        setShowUpdatePrompt(true);
      } else if (!storedVersion) {
        // First visit, store current version
        localStorage.setItem('app_version', serverVersion.version);
      }
    } catch (error) {
      console.warn('Version check failed:', error);

      // Fallback to build timestamp check if available
      if (typeof (globalThis as any).__BUILD_TIMESTAMP__ !== 'undefined') {
        const lastVersion = localStorage.getItem('app_version');
        const currentVersion = (globalThis as any).__BUILD_TIMESTAMP__.toString();

        if (lastVersion && lastVersion !== currentVersion) {
          localStorage.setItem('app_version', currentVersion);
          setUpdateType('deployment');
          setShowUpdatePrompt(true);
        } else if (!lastVersion) {
          localStorage.setItem('app_version', currentVersion);
        }
      }
    } finally {
      setIsChecking(false);
    }
  }, [isDismissed]);

  // Handle updates
  const handleUpdate = useCallback(async () => {
    if (updateType === 'deployment') {
      forceRefresh();
    } else if (updateType === 'pwa') {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration && registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          setShowUpdatePrompt(false);
        }
      }
    }
  }, [updateType, forceRefresh]);

  // Dismiss update prompt
  const dismissUpdate = useCallback(() => {
    setShowUpdatePrompt(false);
    setIsDismissed(true);

    // Reset dismissal after 5 minutes
    setTimeout(() => {
      setIsDismissed(false);
    }, 5 * 60 * 1000);
  }, []);

  // Handle PWA service worker updates
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Listen for PWA update events from vite-plugin-pwa
      const handlePWAUpdate = (event: CustomEvent) => {
        console.log('PWA update available');
        if (!isDismissed) {
          setUpdateType('pwa');
          setShowUpdatePrompt(true);
        }
      };

      window.addEventListener('vite:pwa-update', handlePWAUpdate as EventListener);

      // Listen for service worker controller changes
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (showUpdatePrompt && updateType === 'pwa') {
          window.location.reload();
        }
      });

      return () => {
        window.removeEventListener('vite:pwa-update', handlePWAUpdate as EventListener);
      };
    }
  }, [showUpdatePrompt, updateType, isDismissed]);

  // Periodic deployment checks
  useEffect(() => {
    // Initial check after a short delay
    const initialTimeout = setTimeout(checkForDeploymentUpdate, 1000);

    // Check every 30 seconds
    const interval = setInterval(checkForDeploymentUpdate, 30000);

    // Also check when the user comes back to the tab
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkForDeploymentUpdate();
      }
    };

    // Check on focus
    const handleFocus = () => {
      checkForDeploymentUpdate();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [checkForDeploymentUpdate]);

  return {
    showUpdatePrompt,
    updateType,
    isChecking,
    forceRefresh,
    handleUpdate,
    dismissUpdate
  };
}

// Mobile-specific update helper utilities
// Handles the unique challenges of cache management on mobile devices

interface MobileUpdateOptions {
  aggressive?: boolean;
  preserveUserData?: boolean;
  timeout?: number;
}

interface DeviceInfo {
  isMobile: boolean;
  isPWA: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  browser: string;
}

export class MobileUpdateHelper {
  private static instance: MobileUpdateHelper;

  public static getInstance(): MobileUpdateHelper {
    if (!MobileUpdateHelper.instance) {
      MobileUpdateHelper.instance = new MobileUpdateHelper();
    }
    return MobileUpdateHelper.instance;
  }

  // Detect device and browser information
  public getDeviceInfo(): DeviceInfo {
    const userAgent = navigator.userAgent;

    return {
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent),
      isPWA: window.matchMedia('(display-mode: standalone)').matches ||
             (window.navigator as any).standalone ||
             document.referrer.includes('android-app://'),
      isIOS: /iPad|iPhone|iPod/.test(userAgent),
      isAndroid: /Android/.test(userAgent),
      browser: this.getBrowserName(userAgent)
    };
  }

  private getBrowserName(userAgent: string): string {
    if (userAgent.includes('Chrome')) return 'chrome';
    if (userAgent.includes('Safari')) return 'safari';
    if (userAgent.includes('Firefox')) return 'firefox';
    if (userAgent.includes('Edge')) return 'edge';
    return 'unknown';
  }

  // Clear all caches with mobile-specific strategies
  public async clearAllCaches(options: MobileUpdateOptions = {}): Promise<void> {
    const deviceInfo = this.getDeviceInfo();
    console.log('🧹 Starting mobile cache clear for:', deviceInfo);

    try {
      // 1. Clear Cache API storage
      await this.clearCacheStorage();

      // 2. Clear Service Workers
      await this.clearServiceWorkers();

      // 3. Clear IndexedDB (mobile browsers cache heavily here)
      await this.clearIndexedDB(options.preserveUserData);

      // 4. Clear Web Storage
      await this.clearWebStorage(options.preserveUserData);

      // 5. iOS-specific clearing
      if (deviceInfo.isIOS) {
        await this.clearIOSSpecific();
      }

      // 6. Android-specific clearing
      if (deviceInfo.isAndroid) {
        await this.clearAndroidSpecific();
      }

      console.log('✅ Mobile cache clear completed');
    } catch (error) {
      console.error('❌ Mobile cache clear failed:', error);
      throw error;
    }
  }

  private async clearCacheStorage(): Promise<void> {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      console.log('🗑️ Clearing cache storage:', cacheNames);

      await Promise.all(
        cacheNames.map(async (name) => {
          const success = await caches.delete(name);
          console.log(`Cache ${name}: ${success ? 'deleted' : 'failed'}`);
          return success;
        })
      );
    }
  }

  private async clearServiceWorkers(): Promise<void> {
    if ('serviceWorker' in navigator) {
      console.log('🔧 Clearing service workers...');

      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map(async (registration) => {
          console.log('Unregistering SW:', registration.scope);

          // Force update any waiting workers
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }

          return registration.unregister();
        })
      );
    }
  }

  private async clearIndexedDB(preserveUserData = true): Promise<void> {
    if ('indexedDB' in window) {
      console.log('💾 Clearing IndexedDB...');

      try {
        const databases = await indexedDB.databases();
        const preservePatterns = preserveUserData ? ['pglite', 'user-data', 'todos'] : [];

        await Promise.all(
          databases.map((db) => {
            if (db.name) {
              const shouldPreserve = preservePatterns.some(pattern =>
                db.name!.toLowerCase().includes(pattern.toLowerCase())
              );

              if (!shouldPreserve) {
                return new Promise<void>((resolve) => {
                  console.log('Deleting IndexedDB:', db.name);
                  const deleteReq = indexedDB.deleteDatabase(db.name!);
                  deleteReq.onsuccess = () => resolve();
                  deleteReq.onerror = () => resolve(); // Continue even if fails
                  deleteReq.onblocked = () => {
                    setTimeout(() => resolve(), 1000); // Timeout if blocked
                  };
                });
              }
            }
            return Promise.resolve();
          })
        );
      } catch (error) {
        console.warn('IndexedDB clearing failed:', error);
      }
    }
  }

  private async clearWebStorage(preserveUserData = true): Promise<void> {
    console.log('📦 Clearing web storage...');

    const preserveKeys = preserveUserData ? [
      'pglite-data',
      'user-preferences',
      'theme-preference',
      'language'
    ] : [];

    // Preserve important data
    const preservedData: Record<string, string> = {};
    preserveKeys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) preservedData[key] = value;
    });

    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();

    // Restore preserved data
    Object.entries(preservedData).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });

    // Force clear version info
    localStorage.removeItem('app_version');
    localStorage.removeItem('last_version_check');
  }

  private async clearIOSSpecific(): Promise<void> {
    console.log('🍎 Applying iOS-specific cache clearing...');

    // iOS Safari has additional caches
    try {
      // Clear Application Cache (deprecated but still used by some iOS versions)
      if ('applicationCache' in window) {
        const appCache = (window as any).applicationCache;
        if (appCache && appCache.swapCache) {
          appCache.swapCache();
        }
      }

      // Clear WebKit storage
      if ('webkitStorageInfo' in window) {
        const storageInfo = (window as any).webkitStorageInfo;
        storageInfo.requestQuota(
          storageInfo.TEMPORARY,
          0,
          () => console.log('WebKit storage cleared'),
          () => console.log('WebKit storage clear failed')
        );
      }
    } catch (error) {
      console.warn('iOS-specific clearing failed:', error);
    }
  }

  private async clearAndroidSpecific(): Promise<void> {
    console.log('🤖 Applying Android-specific cache clearing...');

    try {
      // Android Chrome has specific cache behaviors
      if (navigator.userAgent.includes('Chrome')) {
        // Force reload of manifest
        const manifestLinks = document.querySelectorAll('link[rel="manifest"]');
        manifestLinks.forEach(link => {
          const href = link.getAttribute('href');
          if (href) {
            link.setAttribute('href', `${href}?v=${Date.now()}`);
          }
        });
      }

      // Clear quota storage more aggressively on Android
      if ('navigator' in window && 'storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        console.log('Storage estimate before clear:', estimate);
      }
    } catch (error) {
      console.warn('Android-specific clearing failed:', error);
    }
  }

  // Perform a mobile-optimized refresh
  public async performMobileRefresh(options: MobileUpdateOptions = {}): Promise<void> {
    const deviceInfo = this.getDeviceInfo();
    console.log('🔄 Performing mobile-optimized refresh...');

    try {
      // Clear caches first
      await this.clearAllCaches(options);

      // Prepare cache-busted URL
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2);
      const url = new URL(window.location.href);

      // Clear existing params
      url.searchParams.delete('v');
      url.searchParams.delete('cb');
      url.searchParams.delete('t');
      url.searchParams.delete('mobile');

      // Add cache-busting params
      url.searchParams.set('v', timestamp.toString());
      url.searchParams.set('cb', random);
      url.searchParams.set('t', Date.now().toString());
      url.searchParams.set('mobile', '1');

      // Use appropriate refresh method based on device
      if (deviceInfo.isPWA) {
        console.log('📱 PWA refresh strategy');
        // For PWAs, we need to be more careful
        window.location.replace(url.toString());
      } else if (deviceInfo.isIOS) {
        console.log('🍎 iOS refresh strategy');
        // iOS needs replace to avoid back button issues
        window.location.replace(url.toString());
      } else if (deviceInfo.isAndroid) {
        console.log('🤖 Android refresh strategy');
        // Android Chrome handles href better
        window.location.href = url.toString();
      } else {
        console.log('📱 Generic mobile refresh strategy');
        window.location.href = url.toString();
      }
    } catch (error) {
      console.error('Mobile refresh failed:', error);
      // Fallback to simple refresh
      const fallbackUrl = `${window.location.origin}${window.location.pathname}?mobile=1&t=${Date.now()}`;
      window.location.href = fallbackUrl;
    }
  }

  // Check if update is needed with mobile-specific logic
  public async checkForMobileUpdate(versionUrl: string): Promise<{
    hasUpdate: boolean;
    serverVersion: string | null;
    error?: string;
  }> {
    const deviceInfo = this.getDeviceInfo();
    console.log('🔍 Checking for updates (mobile-optimized)...');

    try {
      // More aggressive cache-busting for mobile
      const cacheBuster = Date.now();
      const random = Math.random().toString(36).substring(2);

      const headers: HeadersInit = {
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '-1',
        'X-Requested-With': 'XMLHttpRequest',
        'X-Cache-Bust': cacheBuster.toString(),
        'X-Mobile': deviceInfo.isMobile ? '1' : '0',
        'X-PWA': deviceInfo.isPWA ? '1' : '0'
      };

      // Mobile networks can be slow, so extend timeout
      const timeoutMs = deviceInfo.isMobile ? 15000 : 10000;

      const response = await fetch(
        `${versionUrl}?t=${cacheBuster}&r=${random}&mobile=1&cb=${Date.now()}`,
        {
          method: 'GET',
          headers,
          cache: 'no-store',
          signal: AbortSignal.timeout(timeoutMs)
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const serverVersion = await response.json();
      const storedVersion = localStorage.getItem('app_version');

      const hasUpdate = storedVersion && serverVersion.version !== storedVersion;

      console.log('📊 Update check result:', {
        hasUpdate,
        stored: storedVersion,
        server: serverVersion.version,
        device: deviceInfo
      });

      return {
        hasUpdate: Boolean(hasUpdate),
        serverVersion: serverVersion.version
      };
    } catch (error) {
      console.error('Mobile update check failed:', error);
      return {
        hasUpdate: false,
        serverVersion: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Add mobile-specific event listeners for better update detection
  public setupMobileUpdateListeners(onUpdateAvailable: () => void): () => void {
    const deviceInfo = this.getDeviceInfo();
    const listeners: Array<() => void> = [];

    // Standard listeners
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('📱 Tab visible, checking for updates...');
        setTimeout(onUpdateAvailable, 500);
      }
    };

    const handleFocus = () => {
      console.log('📱 Window focused, checking for updates...');
      setTimeout(onUpdateAvailable, 500);
    };

    const handleOnline = () => {
      console.log('🌐 Back online, checking for updates...');
      setTimeout(onUpdateAvailable, 1000);
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        console.log('📱 Page restored from cache, checking for updates...');
        setTimeout(onUpdateAvailable, 1000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('online', handleOnline);
    window.addEventListener('pageshow', handlePageShow);

    listeners.push(
      () => document.removeEventListener('visibilitychange', handleVisibilityChange),
      () => window.removeEventListener('focus', handleFocus),
      () => window.removeEventListener('online', handleOnline),
      () => window.removeEventListener('pageshow', handlePageShow)
    );

    // Mobile-specific listeners
    if (deviceInfo.isMobile) {
      const handleOrientationChange = () => {
        console.log('📱 Orientation changed, checking for updates...');
        setTimeout(onUpdateAvailable, 1000);
      };

      const handleTouchStart = () => {
        // Check for updates when user starts interacting (but throttle)
        const lastCheck = localStorage.getItem('last_touch_check');
        const now = Date.now();
        if (!lastCheck || now - parseInt(lastCheck) > 60000) { // Max once per minute
          localStorage.setItem('last_touch_check', now.toString());
          setTimeout(onUpdateAvailable, 2000);
        }
      };

      window.addEventListener('orientationchange', handleOrientationChange);
      document.addEventListener('touchstart', handleTouchStart, { passive: true, once: true });

      listeners.push(
        () => window.removeEventListener('orientationchange', handleOrientationChange),
        () => document.removeEventListener('touchstart', handleTouchStart)
      );
    }

    // Return cleanup function
    return () => {
      listeners.forEach(cleanup => cleanup());
    };
  }
}

// Export singleton instance and utility functions
export const mobileUpdateHelper = MobileUpdateHelper.getInstance();

export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

export const isPWAInstalled = (): boolean => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone ||
    document.referrer.includes('android-app://')
  );
};

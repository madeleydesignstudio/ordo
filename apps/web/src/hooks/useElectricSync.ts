import { useState, useCallback, useRef, useEffect } from "react";
import { usePGlite } from "@electric-sql/pglite-react";
import {
  hasElectricSync,
  setupTasksSync,
  type ElectricSyncConfig,
  type SyncSubscription,
} from "@ordo/local-db";

interface ElectricSyncState {
  isInitialized: boolean;
  isLoading: boolean;
  isSyncing: boolean;
  isUpToDate: boolean;
  error: string | null;
  lastSyncTime: Date | null;
}

interface UseElectricSyncOptions {
  config?: ElectricSyncConfig;
  autoStart?: boolean;
  onDataChange?: () => void;
}

export function useElectricSync(options: UseElectricSyncOptions = {}) {
  const { config, autoStart = false, onDataChange } = options;

  const [syncState, setSyncState] = useState<ElectricSyncState>({
    isInitialized: false,
    isLoading: false,
    isSyncing: false,
    isUpToDate: false,
    error: null,
    lastSyncTime: null,
  });

  const pgliteClient = usePGlite();
  const subscriptionRef = useRef<SyncSubscription | null>(null);
  const initRef = useRef(false);

  // Check if the PGlite instance has Electric sync capability
  const canSync = hasElectricSync(pgliteClient);

  // Initialize sync
  const initializeSync = useCallback(async () => {
    if (!canSync || !config || initRef.current || syncState.isLoading || syncState.isInitialized) {
      console.log("[useElectricSync] Skipping init:", { 
        canSync, 
        hasConfig: !!config, 
        alreadyInit: initRef.current,
        isLoading: syncState.isLoading,
        isInitialized: syncState.isInitialized
      });
      return;
    }

    console.log("[useElectricSync] Starting ElectricSQL sync initialization...");
    console.log("[useElectricSync] Config:", {
      url: config.electricUrl,
      sourceId: config.sourceId?.substring(0, 8) + '...',
      secretLength: config.secret?.length || 0
    });

    setSyncState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      initRef.current = true;

      // Check if PGlite has the electric extension
      if (!pgliteClient.electric) {
        throw new Error("PGlite instance missing electric extension");
      }

      console.log("[useElectricSync] PGlite electric extension found, setting up tasks sync...");

      // Set up tasks sync with data change callback
      const subscription = await setupTasksSync(pgliteClient, config, {
        onDataChange: () => {
          console.log("[useElectricSync] ElectricSQL data changed, triggering callback");
          if (onDataChange) onDataChange();
        }
      });

      subscriptionRef.current = subscription;

      // Log subscription details
      console.log("[useElectricSync] Subscription created:", {
        isUpToDate: subscription.isUpToDate,
        hasRawSubscription: !!subscription.subscription
      });

      setSyncState(prev => ({
        ...prev,
        isInitialized: true,
        isLoading: false,
        isUpToDate: subscription.isUpToDate,
        lastSyncTime: new Date(),
      }));

      console.log("[useElectricSync] ✅ ElectricSQL sync initialized successfully");

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown sync error";

      setSyncState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      console.error("[useElectricSync] ❌ Failed to initialize ElectricSQL sync:", error);
      initRef.current = false;
      
      // Clean up any partial subscription
      if (subscriptionRef.current) {
        try {
          subscriptionRef.current.unsubscribe();
          subscriptionRef.current = null;
        } catch (cleanupError) {
          console.warn("[useElectricSync] Error during cleanup:", cleanupError);
        }
      }
    }
  }, [canSync, config, pgliteClient, syncState.isLoading, syncState.isInitialized]);

  // Start sync manually
  const startSync = useCallback(async () => {
    if (!canSync || !config) {
      setSyncState(prev => ({
        ...prev,
        error: "Sync not available or not configured",
      }));
      return;
    }

    if (!syncState.isInitialized) {
      await initializeSync();
    }
  }, [canSync, config, syncState.isInitialized, initializeSync]);

  // Stop sync
  const stopSync = useCallback(() => {
    console.log("[useElectricSync] Stopping sync...");
    
    if (subscriptionRef.current) {
      try {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
        console.log("[useElectricSync] Subscription unsubscribed successfully");
      } catch (error) {
        console.warn("[useElectricSync] Error during unsubscribe:", error);
      }
    }

    setSyncState(prev => ({
      ...prev,
      isInitialized: false,
      isSyncing: false,
      isUpToDate: false,
      isLoading: false,
      error: null,
    }));

    initRef.current = false;
    console.log("[useElectricSync] ElectricSQL sync stopped");
  }, []);

  // Restart sync
  const restartSync = useCallback(async () => {
    stopSync();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait a bit
    await startSync();
  }, [stopSync, startSync]);

  // Clear error
  const clearError = useCallback(() => {
    setSyncState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  // Auto-start sync if enabled
  useEffect(() => {
    if (autoStart && canSync && config && !syncState.isInitialized && !initRef.current && !syncState.isLoading) {
      console.log("[useElectricSync] Auto-starting sync...");
      initializeSync();
    }
  }, [autoStart, canSync, config, syncState.isInitialized, syncState.isLoading, initializeSync]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, []);

  // Update sync status based on subscription - check periodically
  useEffect(() => {
    if (!subscriptionRef.current) return;

    console.log("[useElectricSync] Setting up periodic status checks...");

    const interval = setInterval(() => {
      if (subscriptionRef.current) {
        const wasUpToDate = syncState.isUpToDate;
        const isNowUpToDate = subscriptionRef.current?.isUpToDate || false;

        if (wasUpToDate !== isNowUpToDate) {
          console.log("[useElectricSync] Sync status changed:", { from: wasUpToDate, to: isNowUpToDate });
        }

        setSyncState(prev => ({
          ...prev,
          isUpToDate: isNowUpToDate,
          lastSyncTime: isNowUpToDate ? new Date() : prev.lastSyncTime,
        }));
      }
    }, 2000); // Check every 2 seconds

    return () => {
      console.log("[useElectricSync] Cleaning up periodic status checks");
      clearInterval(interval);
    };
  }, [subscriptionRef.current, syncState.isUpToDate]);

  return {
    // State
    isInitialized: syncState.isInitialized,
    isLoading: syncState.isLoading,
    isSyncing: syncState.isSyncing,
    isUpToDate: syncState.isUpToDate,
    error: syncState.error,
    lastSyncTime: syncState.lastSyncTime,
    canSync,

    // Actions
    startSync,
    stopSync,
    restartSync,
    clearError,

    // Raw subscription for advanced usage
    subscription: subscriptionRef.current,
  };
}

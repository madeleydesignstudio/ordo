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

  // Check if we can sync (have config and PGlite with Electric)
  const canSync = Boolean(
    config && pgliteClient && hasElectricSync(pgliteClient)
  );

  const startSync = useCallback(async () => {
    if (!config || !pgliteClient || !hasElectricSync(pgliteClient)) {
      console.log("[useElectricSync] Cannot start sync: missing config or PGlite client");
      setSyncState(prev => ({
        ...prev,
        error: "Cannot start sync: missing config or database client"
      }));
      return;
    }

    if (subscriptionRef.current) {
      console.log("[useElectricSync] ⚠️ Sync already active, skipping");
      return;
    }

    console.log("[useElectricSync] Starting Electric sync...");
    setSyncState(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }));

    console.log("[useElectricSync] 🚀 Starting sync with config:", {
      url: config.electricUrl,
      sourceId: config.sourceId,
      hasSecret: !!config.secret,
      debug: config.debug
    });

    try {
      console.log("[useElectricSync] PGlite client:", typeof pgliteClient);
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
        isSyncing: true,
        isUpToDate: subscription.isUpToDate,
        lastSyncTime: new Date(),
        error: null
      }));

      // Debug: Monitor subscription status changes
      if (subscription.subscription?.subscribe) {
        subscription.subscription.subscribe(() => {
          console.log("[useElectricSync] 🔄 Subscription status changed - shape is up to date");
          setSyncState(prev => ({ ...prev, isUpToDate: true, lastSyncTime: new Date() }));
        });
      }

      console.log("[useElectricSync] ✅ Electric sync started successfully");

      // Debug: Log subscription details
      console.log("[useElectricSync] Subscription details:", {
        isUpToDate: subscription.isUpToDate,
        shapeId: subscription.subscription?.shapeId || 'unknown',
        hasStream: !!subscription.subscription?.stream
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("[useElectricSync] ❌ Failed to start sync:", errorMessage);

      setSyncState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
    }
  }, [config, pgliteClient]);

  const stopSync = useCallback(() => {
    if (subscriptionRef.current) {
      console.log("[useElectricSync] Stopping sync...");
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;

      setSyncState(prev => ({
        ...prev,
        isSyncing: false,
        isUpToDate: false
      }));

      console.log("[useElectricSync] Sync stopped");
    }
  }, []);

  const restartSync = useCallback(async () => {
    console.log("[useElectricSync] Restarting sync...");
    stopSync();
    // Small delay to ensure cleanup
    setTimeout(() => {
      startSync();
    }, 100);
  }, [stopSync, startSync]);

  const clearError = useCallback(() => {
    setSyncState(prev => ({ ...prev, error: null }));
  }, []);

  // Auto-start effect
  useEffect(() => {
    if (autoStart && canSync && !syncState.isInitialized && !syncState.isLoading) {
      console.log("[useElectricSync] Auto-starting sync...");
      startSync();
    }
  }, [autoStart, canSync, syncState.isInitialized, syncState.isLoading, startSync]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (subscriptionRef.current) {
        console.log("[useElectricSync] Cleaning up subscription on unmount");
        subscriptionRef.current.unsubscribe();
      }
    };
  }, []);

  return {
    ...syncState,
    canSync,
    startSync,
    stopSync,
    restartSync,
    clearError,
  };
}

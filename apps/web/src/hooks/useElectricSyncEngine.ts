import type { PGliteWithLive } from "@electric-sql/pglite/live";
import { usePGlite } from "@electric-sql/pglite-react";
import type { PGliteWithSync } from "@electric-sql/pglite-sync";
import { startSync, useSyncStatus, waitForInitialSyncDone } from "@ordo/local-db";
import { useCallback, useEffect, useRef, useState } from "react";

type PGliteWithExtensions = PGliteWithLive & PGliteWithSync;

interface ElectricSyncEngineState {
  isInitialized: boolean;
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  lastSyncTime: Date | null;
}

interface UseElectricSyncEngineOptions {
  autoStart?: boolean;
  onDataChange?: () => void;
}

export function useElectricSyncEngine(options: UseElectricSyncEngineOptions = {}) {
  const { autoStart = false, onDataChange } = options;

  const [syncState, setSyncState] = useState<ElectricSyncEngineState>({
    isInitialized: false,
    isLoading: false,
    isSyncing: false,
    error: null,
    lastSyncTime: null,
  });

  const pgliteClient = usePGlite() as PGliteWithExtensions;
  const syncStartedRef = useRef<boolean>(false);

  // Use the sync status hook from the Electric sync engine
  const [syncStatus, syncMessage] = useSyncStatus();

  // Check if we can sync (have PGlite with sync and live extensions)
  const canSync = Boolean(pgliteClient && pgliteClient.sync && pgliteClient.live);

  const startSyncEngine = useCallback(async () => {
    if (!pgliteClient || !canSync) {
      console.log(
        "[useElectricSyncEngine] Cannot start sync: missing PGlite client with extensions"
      );
      setSyncState((prev) => ({
        ...prev,
        error: "Cannot start sync: missing database client with sync extensions",
      }));
      return;
    }

    if (syncStartedRef.current) {
      console.log("[useElectricSyncEngine] ⚠️ Sync already started, skipping");
      return;
    }

    console.log("[useElectricSyncEngine] Starting Electric sync engine...");
    setSyncState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      // Start the Electric SQL sync engine (based on Linear Lite example)
      await startSync(pgliteClient);

      syncStartedRef.current = true;

      setSyncState((prev) => ({
        ...prev,
        isInitialized: true,
        isLoading: false,
        isSyncing: true,
        lastSyncTime: new Date(),
        error: null,
      }));

      console.log("[useElectricSyncEngine] ✅ Electric sync engine started successfully");

      // Set up data change callback if provided
      if (onDataChange) {
        // Monitor for changes using live queries
        pgliteClient.live.query("SELECT COUNT(*) as count FROM tasks", [], () => {
          console.log("[useElectricSyncEngine] Data changed, triggering callback");
          onDataChange();
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("[useElectricSyncEngine] ❌ Failed to start sync engine:", errorMessage);

      setSyncState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, [pgliteClient, canSync, onDataChange]);

  const stopSyncEngine = useCallback(() => {
    if (syncStartedRef.current) {
      console.log("[useElectricSyncEngine] Stopping sync engine...");
      syncStartedRef.current = false;

      setSyncState((prev) => ({
        ...prev,
        isSyncing: false,
        isInitialized: false,
      }));

      console.log("[useElectricSyncEngine] Sync engine stopped");
    }
  }, []);

  const restartSyncEngine = useCallback(async () => {
    console.log("[useElectricSyncEngine] Restarting sync engine...");
    stopSyncEngine();
    // Small delay to ensure cleanup
    setTimeout(() => {
      startSyncEngine();
    }, 100);
  }, [stopSyncEngine, startSyncEngine]);

  const clearError = useCallback(() => {
    setSyncState((prev) => ({ ...prev, error: null }));
  }, []);

  const waitForSync = useCallback(async () => {
    return waitForInitialSyncDone();
  }, []);

  // Auto-start effect
  useEffect(() => {
    if (
      autoStart &&
      canSync &&
      !syncState.isInitialized &&
      !syncState.isLoading &&
      !syncStartedRef.current
    ) {
      console.log("[useElectricSyncEngine] Auto-starting sync engine...");
      startSyncEngine();
    }
  }, [autoStart, canSync, syncState.isInitialized, syncState.isLoading, startSyncEngine]);

  // Update sync state based on Electric sync status
  useEffect(() => {
    setSyncState((prev) => ({
      ...prev,
      isSyncing: syncStatus === "initial-sync",
    }));
  }, [syncStatus]);

  return {
    ...syncState,
    canSync,
    syncStatus,
    syncMessage,
    startSyncEngine,
    stopSyncEngine,
    restartSyncEngine,
    clearError,
    waitForSync,
  };
}

// Utility hook to get sync status without full sync engine
export function useElectricSyncStatus() {
  return useSyncStatus();
}

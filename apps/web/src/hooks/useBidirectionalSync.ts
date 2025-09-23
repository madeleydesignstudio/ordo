import { useState, useCallback, useRef, useEffect } from "react";
import { usePGlite } from "@electric-sql/pglite-react";
import {
  BidirectionalSyncManager,
  type BidirectionalSyncConfig,
  type BidirectionalSyncState,
  type SyncConflict,
  hasElectricSync,
} from "@ordo/local-db";

interface UseBidirectionalSyncOptions {
  config?: BidirectionalSyncConfig;
  autoStart?: boolean;
}

interface UseBidirectionalSyncState extends BidirectionalSyncState {
  isLoading: boolean;
  error: string | null;
  canSync: boolean;
}

export function useBidirectionalSync(options: UseBidirectionalSyncOptions = {}) {
  const { config, autoStart = false } = options;

  const [syncState, setSyncState] = useState<UseBidirectionalSyncState>({
    isInitialized: false,
    isLoading: false,
    lastSyncTime: null,
    conflictCount: 0,
    syncedRecords: 0,
    failedRecords: 0,
    conflicts: [],
    error: null,
    canSync: false,
  });

  const pgliteClient = usePGlite();
  const syncManagerRef = useRef<BidirectionalSyncManager | null>(null);
  const initRef = useRef(false);

  // Check if the PGlite instance has Electric sync capability
  const canSync = hasElectricSync(pgliteClient);

  // Update canSync state
  useEffect(() => {
    setSyncState(prev => ({
      ...prev,
      canSync,
    }));
  }, [canSync]);

  // Initialize bidirectional sync
  const initializeSync = useCallback(async () => {
    if (!canSync || !config || initRef.current) {
      console.log("[useBidirectionalSync] Skipping init:", {
        canSync,
        hasConfig: !!config,
        alreadyInit: initRef.current
      });
      return;
    }

    console.log("[useBidirectionalSync] Starting bidirectional sync initialization...");
    console.log("[useBidirectionalSync] Config:", {
      url: config.electricUrl,
      sourceId: config.sourceId?.substring(0, 8) + '...',
      secretLength: config.secret?.length || 0,
      conflictResolution: config.conflictResolution || 'latest-wins',
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

      console.log("[useBidirectionalSync] Creating bidirectional sync manager...");

      // Create bidirectional sync manager
      const syncManager = await BidirectionalSyncManager.create(pgliteClient, {
        ...config,
        conflictResolution: config.conflictResolution || 'latest-wins',
        syncInterval: config.syncInterval || 5000,
        enableRealTimeSync: config.enableRealTimeSync !== false,
      });

      syncManagerRef.current = syncManager;

      // Get initial sync state
      const initialState = await syncManager.getSyncState();

      setSyncState(prev => ({
        ...prev,
        ...initialState,
        isLoading: false,
        error: null,
      }));

      console.log("[useBidirectionalSync] ✅ Bidirectional sync initialized successfully");

      // Set up event listeners for sync events
      const handleSyncEvent = (event: Event) => {
        const customEvent = event as CustomEvent;
        console.log("[useBidirectionalSync] Sync event:", customEvent.type, customEvent.detail);

        // Update state based on sync events
        if (customEvent.type === 'bidirectional-sync-initial-sync-complete') {
          setSyncState(prev => ({
            ...prev,
            lastSyncTime: new Date(),
          }));
        }
      };

      window.addEventListener('bidirectional-sync-initial-sync-complete', handleSyncEvent);
      window.addEventListener('bidirectional-sync-sync-up-to-date', handleSyncEvent);

      // Store cleanup function
      (syncManager as any)._eventCleanup = () => {
        window.removeEventListener('bidirectional-sync-initial-sync-complete', handleSyncEvent);
        window.removeEventListener('bidirectional-sync-sync-up-to-date', handleSyncEvent);
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown sync error";

      setSyncState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      console.error("[useBidirectionalSync] ❌ Failed to initialize bidirectional sync:", error);
      initRef.current = false;
    }
  }, [canSync, config, pgliteClient]);

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
  const stopSync = useCallback(async () => {
    if (syncManagerRef.current) {
      await syncManagerRef.current.shutdown();

      // Clean up event listeners
      if ((syncManagerRef.current as any)._eventCleanup) {
        (syncManagerRef.current as any)._eventCleanup();
      }

      syncManagerRef.current = null;
    }

    setSyncState(prev => ({
      ...prev,
      isInitialized: false,
      isLoading: false,
      lastSyncTime: null,
      conflictCount: 0,
      syncedRecords: 0,
      failedRecords: 0,
      conflicts: [],
    }));

    initRef.current = false;
    console.log("[useBidirectionalSync] Bidirectional sync stopped");
  }, []);

  // Restart sync
  const restartSync = useCallback(async () => {
    await stopSync();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait a bit
    await startSync();
  }, [stopSync, startSync]);

  // Force sync from remote
  const forceSyncFromRemote = useCallback(async () => {
    if (!syncManagerRef.current) {
      console.warn("[useBidirectionalSync] Sync manager not available for force sync");
      return;
    }

    try {
      setSyncState(prev => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      await syncManagerRef.current.forceSyncFromRemote();

      // Update state
      const newState = await syncManagerRef.current.getSyncState();
      setSyncState(prev => ({
        ...prev,
        ...newState,
        isLoading: false,
      }));

      console.log("[useBidirectionalSync] ✅ Force sync completed");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Force sync failed";

      setSyncState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      console.error("[useBidirectionalSync] ❌ Force sync failed:", error);
    }
  }, []);

  // Resolve a specific conflict
  const resolveConflict = useCallback(async (conflictId: string, resolution: any) => {
    if (!syncManagerRef.current) {
      console.warn("[useBidirectionalSync] Sync manager not available for conflict resolution");
      return;
    }

    try {
      await syncManagerRef.current.resolveConflict(conflictId, resolution);

      // Update state
      const newState = await syncManagerRef.current.getSyncState();
      setSyncState(prev => ({
        ...prev,
        ...newState,
      }));

      console.log("[useBidirectionalSync] ✅ Conflict resolved:", conflictId);
    } catch (error) {
      console.error("[useBidirectionalSync] ❌ Failed to resolve conflict:", error);

      setSyncState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : "Conflict resolution failed",
      }));
    }
  }, []);

  // Get current conflicts
  const getConflicts = useCallback(async (): Promise<SyncConflict[]> => {
    if (!syncManagerRef.current) {
      return [];
    }

    try {
      return await syncManagerRef.current.getConflicts();
    } catch (error) {
      console.error("[useBidirectionalSync] ❌ Failed to get conflicts:", error);
      return [];
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setSyncState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  // Auto-start sync if enabled
  useEffect(() => {
    if (autoStart && canSync && config && !syncState.isInitialized && !initRef.current) {
      console.log("[useBidirectionalSync] Auto-starting sync...");
      initializeSync();
    }
  }, [autoStart, canSync, config, syncState.isInitialized, initializeSync]);

  // Periodic state updates
  useEffect(() => {
    if (!syncManagerRef.current || !syncState.isInitialized) return;

    const interval = setInterval(async () => {
      try {
        const currentState = await syncManagerRef.current!.getSyncState();

        setSyncState(prev => ({
          ...prev,
          ...currentState,
          // Preserve UI-specific state
          isLoading: prev.isLoading,
          error: prev.error,
          canSync: prev.canSync,
        }));
      } catch (error) {
        console.warn("[useBidirectionalSync] Failed to update sync state:", error);
      }
    }, 3000); // Check every 3 seconds

    return () => clearInterval(interval);
  }, [syncState.isInitialized]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (syncManagerRef.current) {
        syncManagerRef.current.shutdown();

        // Clean up event listeners
        if ((syncManagerRef.current as any)._eventCleanup) {
          (syncManagerRef.current as any)._eventCleanup();
        }
      }
    };
  }, []);

  return {
    // State
    isInitialized: syncState.isInitialized,
    isLoading: syncState.isLoading,
    lastSyncTime: syncState.lastSyncTime,
    conflictCount: syncState.conflictCount,
    syncedRecords: syncState.syncedRecords,
    failedRecords: syncState.failedRecords,
    conflicts: syncState.conflicts,
    error: syncState.error,
    canSync: syncState.canSync,

    // Actions
    startSync,
    stopSync,
    restartSync,
    forceSyncFromRemote,
    resolveConflict,
    getConflicts,
    clearError,

    // Raw sync manager for advanced usage
    syncManager: syncManagerRef.current,
  };
}

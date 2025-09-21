import { useState, useCallback, useRef } from "react";
import {
  SyncClient,
  createSyncClient,
  convertTaskToSyncFormat,
} from "../utils/syncClient";
import type { Task } from "./useDatabase";

interface SyncState {
  isLoading: boolean;
  lastSyncTime: Date | null;
  status: "idle" | "syncing" | "success" | "error";
  message: string | null;
  error: string | null;
}

interface SyncStats {
  created: number;
  updated: number;
  errors: number;
}

export function useSync(baseUrl?: string) {
  const [syncState, setSyncState] = useState<SyncState>({
    isLoading: false,
    lastSyncTime: null,
    status: "idle",
    message: null,
    error: null,
  });

  const clientRef = useRef<SyncClient | undefined>(undefined);

  // Initialize client lazily
  const getClient = useCallback(() => {
    if (!clientRef.current) {
      clientRef.current = createSyncClient(baseUrl);
    }
    return clientRef.current;
  }, [baseUrl]);

  // Check if sync backend is available
  const checkBackendStatus = useCallback(async (): Promise<boolean> => {
    try {
      const client = getClient();
      return await client.isOnline();
    } catch {
      return false;
    }
  }, [getClient]);

  // Sync tasks to cloud
  const syncToCloud = useCallback(
    async (
      localTasks: Task[],
    ): Promise<{
      success: boolean;
      stats: SyncStats;
      message: string;
    }> => {
      setSyncState((prev) => ({
        ...prev,
        isLoading: true,
        status: "syncing",
        message: "Checking connection...",
        error: null,
      }));

      try {
        const client = getClient();

        // Convert tasks to sync format
        const syncTasks = localTasks.map(convertTaskToSyncFormat);

        setSyncState((prev) => ({
          ...prev,
          message: `Syncing ${syncTasks.length} tasks to cloud...`,
        }));

        // Push tasks to cloud
        const pushResult = await client.pushTasks(syncTasks);

        if (!pushResult.success) {
          setSyncState((prev) => ({
            ...prev,
            isLoading: false,
            status: "error",
            message: null,
            error: pushResult.error || "Sync failed",
          }));

          return {
            success: false,
            stats: { created: 0, updated: 0, errors: 0 },
            message: pushResult.error || "Sync failed",
          };
        }

        // Extract stats from result
        const stats: SyncStats = {
          created: pushResult.results?.created || 0,
          updated: pushResult.results?.updated || 0,
          errors: pushResult.results?.errors?.length || 0,
        };

        const successMessage = `Successfully synced! Created: ${stats.created}, Updated: ${stats.updated}${stats.errors > 0 ? `, Errors: ${stats.errors}` : ""}`;

        setSyncState((prev) => ({
          ...prev,
          isLoading: false,
          status: "success",
          message: successMessage,
          error: null,
          lastSyncTime: new Date(),
        }));

        return {
          success: true,
          stats,
          message: successMessage,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown sync error";

        setSyncState((prev) => ({
          ...prev,
          isLoading: false,
          status: "error",
          message: null,
          error: errorMessage,
        }));

        return {
          success: false,
          stats: { created: 0, updated: 0, errors: 0 },
          message: errorMessage,
        };
      }
    },
    [getClient],
  );

  // Pull tasks from cloud (for future bidirectional sync)
  const pullFromCloud = useCallback(async (): Promise<{
    success: boolean;
    tasks: Task[];
    message: string;
  }> => {
    setSyncState((prev) => ({
      ...prev,
      isLoading: true,
      status: "syncing",
      message: "Pulling tasks from cloud...",
      error: null,
    }));

    try {
      const client = getClient();
      const result = await client.pullTasks();

      if (!result.success) {
        setSyncState((prev) => ({
          ...prev,
          isLoading: false,
          status: "error",
          message: null,
          error: result.error || "Failed to pull tasks",
        }));

        return {
          success: false,
          tasks: [],
          message: result.error || "Failed to pull tasks",
        };
      }

      setSyncState((prev) => ({
        ...prev,
        isLoading: false,
        status: "success",
        message: `Pulled ${result.tasks.length} tasks from cloud`,
        error: null,
        lastSyncTime: new Date(),
      }));

      // Convert sync format back to local format
      const tasks = result.tasks.map((task) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
      })) as Task[];

      return {
        success: true,
        tasks,
        message: `Pulled ${result.tasks.length} tasks from cloud`,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown pull error";

      setSyncState((prev) => ({
        ...prev,
        isLoading: false,
        status: "error",
        message: null,
        error: errorMessage,
      }));

      return {
        success: false,
        tasks: [],
        message: errorMessage,
      };
    }
  }, [getClient]);

  // Clear sync status
  const clearSyncStatus = useCallback(() => {
    setSyncState((prev) => ({
      ...prev,
      status: "idle",
      message: null,
      error: null,
    }));
  }, []);

  // Reset sync state
  const resetSync = useCallback(() => {
    setSyncState({
      isLoading: false,
      lastSyncTime: null,
      status: "idle",
      message: null,
      error: null,
    });
  }, []);

  return {
    // State
    isLoading: syncState.isLoading,
    status: syncState.status,
    message: syncState.message,
    error: syncState.error,
    lastSyncTime: syncState.lastSyncTime,

    // Actions
    syncToCloud,
    pullFromCloud,
    checkBackendStatus,
    clearSyncStatus,
    resetSync,
  };
}

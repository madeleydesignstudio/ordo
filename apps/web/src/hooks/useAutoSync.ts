import { useCallback, useMemo } from "react";
import { SyncClient, convertTaskToSyncFormat } from "../utils/syncClient";
import type { Task } from "./useDatabase";

interface UseAutoSyncOptions {
  enabled?: boolean;
  baseUrl?: string;
}

export function useAutoSync(options: UseAutoSyncOptions = {}) {
  const { enabled = true, baseUrl } = options;

  // Use production backend URL if no baseUrl provided
  const defaultBaseUrl = import.meta.env.VITE_SYNC_BACKEND_URL || "https://ordo-sync-backend.vercel.app";
  
  // Memoize the sync client to prevent recreating it on every render
  const syncClient = useMemo(() => {
    return new SyncClient(baseUrl || defaultBaseUrl);
  }, [baseUrl, defaultBaseUrl]);

  // Auto-sync a single task to cloud (for CREATE/UPDATE)
  const autoSyncTask = useCallback(async (task: Task): Promise<boolean> => {
    if (!enabled) return true;

    try {
      console.log(`[AutoSync] Syncing task to cloud: ${task.title}`);
      const syncTask = convertTaskToSyncFormat(task);
      const result = await syncClient.pushTasks([syncTask]);
      
      if (result.success) {
        console.log(`[AutoSync] ✅ Successfully synced task: ${task.title}`);
        return true;
      } else {
        console.error(`[AutoSync] ❌ Failed to sync task: ${result.error}`);
        return false;
      }
    } catch (error) {
      console.error(`[AutoSync] ❌ Error syncing task:`, error);
      return false;
    }
  }, [enabled, syncClient]);

  // Auto-sync task deletion to cloud
  const autoDeleteTask = useCallback(async (taskId: string): Promise<boolean> => {
    if (!enabled) return true;

    try {
      console.log(`[AutoSync] Deleting task from cloud: ${taskId}`);
      const result = await syncClient.deleteTask(taskId);
      
      if (result.success) {
        console.log(`[AutoSync] ✅ Successfully deleted task from cloud: ${taskId}`);
        return true;
      } else {
        console.error(`[AutoSync] ❌ Failed to delete task from cloud: ${result.error}`);
        return false;
      }
    } catch (error) {
      console.error(`[AutoSync] ❌ Error deleting task:`, error);
      return false;
    }
  }, [enabled, syncClient]);

  // Check if sync is available
  const checkSyncAvailable = useCallback(async (): Promise<boolean> => {
    if (!enabled) return false;
    return await syncClient.isOnline();
  }, [enabled, syncClient]);

  return {
    autoSyncTask,
    autoDeleteTask,
    checkSyncAvailable,
    enabled,
  };
}

// Sync client utility for web app to communicate with sync backend
export interface SyncTask {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  dueDate: Date | null;
}

export interface SyncResult {
  success: boolean;
  results?: {
    created: number;
    updated: number;
    errors: Array<{ taskId: string; error: string }>;
  };
  message?: string;
  error?: string;
  details?: string;
}

export interface SyncResponse {
  success: boolean;
  tasks: SyncTask[];
  error?: string;
  details?: string;
}

export class SyncClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl ||
      import.meta.env.VITE_SYNC_BACKEND_URL ||
      "https://ordo-sync-backend.vercel.app";
  }

  // Check if the sync backend is available
  async isOnline(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: "GET",
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  // Push local tasks to cloud
  async pushTasks(tasks: SyncTask[]): Promise<SyncResult> {
    try {
      const response = await fetch(`${this.baseUrl}/sync/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tasks }),
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      const result = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        error: "Failed to push tasks",
        details: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Pull all tasks from cloud
  async pullTasks(): Promise<SyncResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/sync/tasks`, {
        method: "GET",
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      const result = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        tasks: [],
        error: "Failed to pull tasks",
        details: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Pull tasks modified since a specific timestamp
  async pullTasksSince(timestamp: Date): Promise<SyncResponse> {
    try {
      const isoTimestamp = timestamp.toISOString();
      const response = await fetch(
        `${this.baseUrl}/sync/tasks/since/${isoTimestamp}`,
        {
          method: "GET",
          signal: AbortSignal.timeout(30000), // 30 second timeout
        },
      );

      const result = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        tasks: [],
        error: "Failed to pull recent tasks",
        details: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Delete a task from cloud
  async deleteTask(taskId: string): Promise<{ success: boolean; error?: string; details?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/sync/tasks/${taskId}`, {
        method: "DELETE",
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      const result = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        error: "Failed to delete task from cloud",
        details: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Full bidirectional sync
  async syncBidirectional(
    localTasks: SyncTask[],
    lastSyncTime?: Date,
  ): Promise<{
    pushResult: SyncResult;
    pullResult: SyncResponse;
    success: boolean;
  }> {
    // First push local changes to cloud
    const pushResult = await this.pushTasks(localTasks);

    // Then pull updates from cloud
    const pullResult = lastSyncTime
      ? await this.pullTasksSince(lastSyncTime)
      : await this.pullTasks();

    return {
      pushResult,
      pullResult,
      success: pushResult.success && pullResult.success,
    };
  }
}

// Utility functions for easier integration
export const createSyncClient = (baseUrl?: string) => new SyncClient(baseUrl);

// Network-aware sync function
export async function smartSync(
  client: SyncClient,
  localTasks: SyncTask[],
  _lastSyncTime?: Date,
): Promise<{
  synced: boolean;
  result?: { pushResult: SyncResult };
  reason?: string;
}> {
  // Check if we're online
  if (!navigator.onLine) {
    return {
      synced: false,
      reason: "Device is offline",
    };
  }

  // Check if sync backend is reachable
  const isBackendOnline = await client.isOnline();
  if (!isBackendOnline) {
    return {
      synced: false,
      reason: "Sync backend is not available",
    };
  }

  // Push tasks to cloud only (simplified sync)
  const pushResult = await client.pushTasks(localTasks);

  return {
    synced: pushResult.success,
    result: { pushResult },
    reason: pushResult.success ? undefined : "Sync operation failed",
  };
}

// Convert local database task to sync format
export function convertTaskToSyncFormat(task: any): SyncTask {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    completed: task.completed,
    createdAt:
      task.createdAt instanceof Date
        ? task.createdAt
        : new Date(task.createdAt),
    updatedAt:
      task.updatedAt instanceof Date
        ? task.updatedAt
        : new Date(task.updatedAt),
    dueDate: task.dueDate
      ? task.dueDate instanceof Date
        ? task.dueDate
        : new Date(task.dueDate)
      : null,
  };
}

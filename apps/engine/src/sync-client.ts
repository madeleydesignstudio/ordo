// Sync client utility for frontend integration with the sync backend
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

  constructor(baseUrl: string = "http://localhost:3001") {
    this.baseUrl = baseUrl;
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
  lastSyncTime?: Date,
): Promise<{
  synced: boolean;
  result?: { pushResult: SyncResult; pullResult: SyncResponse };
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

  // Perform bidirectional sync
  const result = await client.syncBidirectional(localTasks, lastSyncTime);

  return {
    synced: result.success,
    result,
    reason: result.success ? undefined : "Sync operation failed",
  };
}

// Auto-sync on network connection
export function setupAutoSync(
  client: SyncClient,
  getLocalTasks: () => SyncTask[],
  onSyncComplete: (result: {
    synced: boolean;
    result?: any;
    reason?: string;
  }) => void,
  getLastSyncTime?: () => Date | undefined,
) {
  const performSync = async () => {
    const localTasks = getLocalTasks();
    const lastSyncTime = getLastSyncTime?.();

    const result = await smartSync(client, localTasks, lastSyncTime);
    onSyncComplete(result);
  };

  // Sync when coming back online
  window.addEventListener("online", async () => {
    console.log("Network connection restored - starting sync...");
    await performSync();
  });

  // Initial sync if already online
  if (navigator.onLine) {
    performSync();
  }

  // Optional: periodic sync when online
  const periodicSync = setInterval(
    async () => {
      if (navigator.onLine) {
        await performSync();
      }
    },
    5 * 60 * 1000,
  ); // Every 5 minutes

  // Return cleanup function
  return () => {
    clearInterval(periodicSync);
    window.removeEventListener("online", performSync);
  };
}

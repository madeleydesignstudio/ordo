import type { ElectricSyncConfig, SyncSubscription } from "./sync.js";

export interface BidirectionalSyncConfig extends ElectricSyncConfig {
  conflictResolution?: 'latest-wins' | 'manual' | 'merge';
  syncInterval?: number;
  enableRealTimeSync?: boolean;
}

export interface SyncConflict {
  recordId: string;
  localRecord: any;
  remoteRecord: any;
  conflictType: 'update' | 'delete' | 'create';
  timestamp: Date;
}

export interface BidirectionalSyncState {
  isInitialized: boolean;
  lastSyncTime: Date | null;
  conflictCount: number;
  syncedRecords: number;
  failedRecords: number;
  conflicts: SyncConflict[];
}

export class BidirectionalSyncManager {
  private pglite: any;
  private config: BidirectionalSyncConfig;
  private subscription: SyncSubscription | null = null;
  private state: BidirectionalSyncState;
  private conflictHandlers: Map<string, (conflict: SyncConflict) => Promise<any>>;

  constructor(pglite: any, config: BidirectionalSyncConfig) {
    this.pglite = pglite;
    this.config = {
      conflictResolution: 'latest-wins',
      syncInterval: 5000,
      enableRealTimeSync: true,
      ...config,
    };

    this.state = {
      isInitialized: false,
      lastSyncTime: null,
      conflictCount: 0,
      syncedRecords: 0,
      failedRecords: 0,
      conflicts: [],
    };

    this.conflictHandlers = new Map();
    this.setupDefaultConflictHandlers();
  }

  private setupDefaultConflictHandlers() {
    // Latest timestamp wins conflict resolution
    this.conflictHandlers.set('latest-wins', async (conflict: SyncConflict) => {
      const localUpdated = new Date(conflict.localRecord.updated_at);
      const remoteUpdated = new Date(conflict.remoteRecord.updated_at);

      console.log(`[BidirectionalSync] Resolving conflict for ${conflict.recordId}:`, {
        local: localUpdated.toISOString(),
        remote: remoteUpdated.toISOString(),
        winner: remoteUpdated >= localUpdated ? 'remote' : 'local'
      });

      return remoteUpdated >= localUpdated ? conflict.remoteRecord : conflict.localRecord;
    });

    // Merge strategy - combines non-conflicting fields
    this.conflictHandlers.set('merge', async (conflict: SyncConflict) => {
      const merged = { ...conflict.localRecord };

      // Use remote data for fields that are more recent or have more data
      Object.keys(conflict.remoteRecord).forEach(key => {
        if (key === 'updated_at') {
          // Always use the latest timestamp
          merged[key] = new Date(Math.max(
            new Date(conflict.localRecord[key]).getTime(),
            new Date(conflict.remoteRecord[key]).getTime()
          ));
        } else if (!conflict.localRecord[key] && conflict.remoteRecord[key]) {
          // Use remote data if local is empty
          merged[key] = conflict.remoteRecord[key];
        } else if (conflict.remoteRecord[key] &&
                   new Date(conflict.remoteRecord.updated_at) > new Date(conflict.localRecord.updated_at)) {
          // Use remote data if it's more recent
          merged[key] = conflict.remoteRecord[key];
        }
      });

      console.log(`[BidirectionalSync] Merged conflict for ${conflict.recordId}:`, merged);
      return merged;
    });
  }

  async initialize(): Promise<void> {
    if (this.state.isInitialized) {
      console.log('[BidirectionalSync] Already initialized');
      return;
    }

    console.log('[BidirectionalSync] Initializing bidirectional sync...');

    try {
      // Setup UPSERT functions for conflict-free syncing
      await this.setupConflictResolutionFunctions();

      // Initialize ElectricSQL subscription with custom conflict handling
      this.subscription = await this.setupElectricSyncWithConflicts();

      this.state.isInitialized = true;
      this.state.lastSyncTime = new Date();

      console.log('[BidirectionalSync] ✅ Bidirectional sync initialized successfully');

      // Start real-time sync monitoring if enabled
      if (this.config.enableRealTimeSync) {
        this.startRealTimeMonitoring();
      }

    } catch (error) {
      console.error('[BidirectionalSync] ❌ Failed to initialize:', error);
      throw error;
    }
  }

  private async setupConflictResolutionFunctions(): Promise<void> {
    try {
      // Create UPSERT function that handles conflicts gracefully
      await this.pglite.query(`
        CREATE OR REPLACE FUNCTION smart_upsert_task(
          task_id text,
          task_title text,
          task_description text,
          task_completed boolean,
          task_created_at timestamp,
          task_updated_at timestamp,
          task_due_date timestamp,
          conflict_strategy text DEFAULT 'latest-wins'
        ) RETURNS json AS $$
        DECLARE
          existing_record record;
          result json;
        BEGIN
          -- Check if record exists
          SELECT * INTO existing_record FROM tasks WHERE id = task_id;

          IF existing_record IS NULL THEN
            -- Record doesn't exist, safe to insert
            INSERT INTO tasks (id, title, description, completed, created_at, updated_at, due_date)
            VALUES (task_id, task_title, task_description, task_completed, task_created_at, task_updated_at, task_due_date);

            result := json_build_object(
              'action', 'inserted',
              'conflict', false,
              'id', task_id
            );
          ELSE
            -- Record exists, check for conflicts
            IF existing_record.updated_at > task_updated_at AND conflict_strategy = 'latest-wins' THEN
              -- Local record is newer, keep it
              result := json_build_object(
                'action', 'kept_local',
                'conflict', true,
                'reason', 'local_newer',
                'id', task_id
              );
            ELSE
              -- Remote record is newer or equal, update
              UPDATE tasks SET
                title = task_title,
                description = task_description,
                completed = task_completed,
                updated_at = GREATEST(existing_record.updated_at, task_updated_at),
                due_date = task_due_date
              WHERE id = task_id;

              result := json_build_object(
                'action', 'updated',
                'conflict', existing_record.updated_at != task_updated_at,
                'id', task_id
              );
            END IF;
          END IF;

          RETURN result;
        END;
        $$ LANGUAGE plpgsql;
      `);

      // Create a function to get sync statistics
      await this.pglite.query(`
        CREATE OR REPLACE FUNCTION get_sync_stats()
        RETURNS json AS $$
        BEGIN
          RETURN json_build_object(
            'total_tasks', (SELECT COUNT(*) FROM tasks),
            'completed_tasks', (SELECT COUNT(*) FROM tasks WHERE completed = true),
            'pending_tasks', (SELECT COUNT(*) FROM tasks WHERE completed = false),
            'last_updated', (SELECT MAX(updated_at) FROM tasks)
          );
        END;
        $$ LANGUAGE plpgsql;
      `);

      console.log('[BidirectionalSync] ✅ Conflict resolution functions created');
    } catch (error) {
      console.error('[BidirectionalSync] ❌ Failed to create conflict resolution functions:', error);
      throw error;
    }
  }

  private async setupElectricSyncWithConflicts(): Promise<SyncSubscription> {
    console.log('[BidirectionalSync] Setting up ElectricSQL with conflict resolution...');

    const subscription = await this.pglite.electric.syncShapeToTable({
      shape: {
        url: `${this.config.electricUrl}/v1/shape`,
        params: {
          table: 'tasks',
          source_id: this.config.sourceId,
          secret: this.config.secret,
        },
      },
      table: 'tasks',
      schema: 'public',
      primaryKey: ['id'],
      shapeKey: 'tasks',
      initialInsertMethod: 'json',

      // Custom column mapping with conflict resolution
      mapColumns: (message: any) => {
        return this.handleIncomingMessage(message);
      },

      onInitialSync: () => {
        this.handleInitialSyncComplete();
      },

      // Handle must-refetch scenarios
      onMustRefetch: async (tx: any) => {
        console.log('[BidirectionalSync] Handling must-refetch event...');
        await this.handleMustRefetch(tx);
      },
    });

    console.log('[BidirectionalSync] ✅ ElectricSQL subscription created');
    return {
      isUpToDate: subscription.isUpToDate,
      unsubscribe: () => subscription.unsubscribe(),
      subscription,
    };
  }

  private async handleIncomingMessage(message: any): Promise<any> {
    console.log('[BidirectionalSync] Processing incoming message:', message);

    try {
      // Use smart upsert function for conflict resolution
      if (message.__op === 'INSERT' || message.__op === 'UPDATE') {
        const result = await this.pglite.query(`
          SELECT smart_upsert_task($1, $2, $3, $4, $5, $6, $7, $8) as result
        `, [
          message.id,
          message.title,
          message.description,
          message.completed,
          message.created_at,
          message.updated_at,
          message.due_date,
          this.config.conflictResolution
        ]);

        const upsertResult = result.rows[0]?.result;

        if (upsertResult?.conflict) {
          this.state.conflictCount++;
          console.log('[BidirectionalSync] Conflict resolved:', upsertResult);
        }

        this.state.syncedRecords++;
        return null; // Return null to indicate we handled it manually
      }

      if (message.__op === 'DELETE') {
        await this.pglite.query('DELETE FROM tasks WHERE id = $1', [message.id]);
        return null;
      }

      // For unknown operations, return the message as-is
      return message;

    } catch (error) {
      console.error('[BidirectionalSync] ❌ Error processing message:', error);
      this.state.failedRecords++;

      // Return the message to let ElectricSQL handle it with default behavior
      return message;
    }
  }

  private async handleInitialSyncComplete(): Promise<void> {
    console.log('[BidirectionalSync] ✅ Initial sync complete');

    try {
      const stats = await this.pglite.query('SELECT get_sync_stats() as stats');
      const syncStats = stats.rows[0]?.stats;

      console.log('[BidirectionalSync] Sync statistics:', syncStats);
      this.state.lastSyncTime = new Date();

      // Emit sync complete event
      this.emitSyncEvent('initial-sync-complete', { stats: syncStats });
    } catch (error) {
      console.error('[BidirectionalSync] Error getting sync stats:', error);
    }
  }

  private async handleMustRefetch(tx: any): Promise<void> {
    console.log('[BidirectionalSync] Handling must-refetch - clearing conflicted data...');

    try {
      // Clear tasks that might have conflicts
      // In a more sophisticated implementation, you'd selectively clear based on timestamps
      await tx.query('DELETE FROM tasks WHERE updated_at < (SELECT MAX(updated_at) FROM tasks) - INTERVAL \'1 hour\'');

      console.log('[BidirectionalSync] ✅ Prepared for data refetch');
    } catch (error) {
      console.error('[BidirectionalSync] ❌ Error during must-refetch:', error);
    }
  }

  private startRealTimeMonitoring(): void {
    if (!this.config.enableRealTimeSync) return;

    console.log('[BidirectionalSync] Starting real-time monitoring...');

    setInterval(() => {
      if (this.subscription) {
        const wasUpToDate = this.subscription.isUpToDate;

        // Check if sync status changed
        if (this.subscription.isUpToDate && !wasUpToDate) {
          console.log('[BidirectionalSync] Sync caught up - all data is current');
          this.emitSyncEvent('sync-up-to-date', { timestamp: new Date() });
        }
      }
    }, this.config.syncInterval || 5000);
  }

  private emitSyncEvent(type: string, data: any): void {
    // In a real implementation, this would emit events that components can listen to
    console.log(`[BidirectionalSync] Event: ${type}`, data);

    // You could implement a proper event emitter here
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(`bidirectional-sync-${type}`, { detail: data }));
    }
  }

  // Public API methods

  async getSyncState(): Promise<BidirectionalSyncState> {
    return { ...this.state };
  }

  async forceSyncFromRemote(): Promise<void> {
    console.log('[BidirectionalSync] Forcing sync from remote...');

    if (this.subscription) {
      // In ElectricSQL, you might need to restart the subscription
      console.log('[BidirectionalSync] Restarting subscription for fresh sync...');

      this.subscription.unsubscribe();
      this.subscription = await this.setupElectricSyncWithConflicts();
    }
  }

  async getConflicts(): Promise<SyncConflict[]> {
    return [...this.state.conflicts];
  }

  async resolveConflict(conflictId: string, resolution: any): Promise<void> {
    console.log(`[BidirectionalSync] Manually resolving conflict: ${conflictId}`, resolution);

    // Apply the manual resolution
    await this.pglite.query(`
      UPDATE tasks SET
        title = $2,
        description = $3,
        completed = $4,
        updated_at = NOW()
      WHERE id = $1
    `, [conflictId, resolution.title, resolution.description, resolution.completed]);

    // Remove from conflicts list
    this.state.conflicts = this.state.conflicts.filter(c => c.recordId !== conflictId);
    this.state.conflictCount = Math.max(0, this.state.conflictCount - 1);
  }

  async shutdown(): Promise<void> {
    console.log('[BidirectionalSync] Shutting down...');

    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }

    this.state.isInitialized = false;
  }

  // Static helper method to create and initialize
  static async create(pglite: any, config: BidirectionalSyncConfig): Promise<BidirectionalSyncManager> {
    const manager = new BidirectionalSyncManager(pglite, config);
    await manager.initialize();
    return manager;
  }
}

// Utility functions for conflict resolution strategies

export function createTimestampBasedResolver(): (conflict: SyncConflict) => Promise<any> {
  return async (conflict: SyncConflict) => {
    const localTime = new Date(conflict.localRecord.updated_at).getTime();
    const remoteTime = new Date(conflict.remoteRecord.updated_at).getTime();

    return remoteTime >= localTime ? conflict.remoteRecord : conflict.localRecord;
  };
}

export function createFieldMergeResolver(fieldPriority: string[] = []): (conflict: SyncConflict) => Promise<any> {
  return async (conflict: SyncConflict) => {
    const merged = { ...conflict.localRecord };

    // Apply field-specific merge logic
    fieldPriority.forEach(field => {
      if (conflict.remoteRecord[field] !== undefined) {
        merged[field] = conflict.remoteRecord[field];
      }
    });

    // Always use the latest timestamp
    merged.updated_at = new Date(Math.max(
      new Date(conflict.localRecord.updated_at).getTime(),
      new Date(conflict.remoteRecord.updated_at).getTime()
    ));

    return merged;
  };
}

// Export the main sync function for easy integration
export async function setupBidirectionalSync(
  pglite: any,
  config: BidirectionalSyncConfig
): Promise<BidirectionalSyncManager> {
  return BidirectionalSyncManager.create(pglite, config);
}

import { PGlite } from "@electric-sql/pglite";
import { electricSync } from "@electric-sql/pglite-sync";

export interface ElectricSyncConfig {
  electricUrl: string;
  sourceId: string;
  secret: string;
  debug?: boolean;
}

export interface SyncShape {
  table: string;
  primaryKey: string[];
  schema?: string;
  shapeKey?: string;
}

export interface SyncSubscription {
  isUpToDate: boolean;
  unsubscribe: () => void;
  subscription?: any; // Raw subscription for debugging
}

export interface MultiSyncSubscription {
  isUpToDate: boolean;
  unsubscribe: () => void;
  subscription?: any; // Raw subscription for debugging
}

// Create PGlite instance with Electric sync extension
export async function createPGliteWithSync(
  dataDir = "idb://ordo-db",
): Promise<any> {
  const pglite = await PGlite.create(dataDir, {
    extensions: {
      electric: electricSync({
        metadataSchema: "electric",
        debug: false,
      }),
    },
  });

  return pglite;
}

// Track active subscriptions to prevent duplicates
const activeSubscriptions = new Map<string, any>();

// Sync a single shape to a table
export async function syncShapeToTable(
  pglite: any,
  config: ElectricSyncConfig,
  shape: SyncShape,
  callbacks?: {
    onDataChange?: () => void;
  }
): Promise<SyncSubscription> {
  const shapeKey = shape.shapeKey || shape.table;

  console.log(`[ElectricSync] Starting sync for table: ${shape.table}`);
  console.log(`[ElectricSync] Config:`, {
    url: `${config.electricUrl}/v1/shape`,
    table: shape.table,
    schema: shape.schema || "public",
    primaryKey: shape.primaryKey,
    shapeKey: shapeKey,
  });

  // Check if we already have an active subscription for this shape
  if (activeSubscriptions.has(shapeKey)) {
    console.log(`[ElectricSync] ⚠️ Reusing existing subscription for shape: ${shapeKey}`);
    const existingSubscription = activeSubscriptions.get(shapeKey);
    return {
      isUpToDate: existingSubscription.isUpToDate,
      unsubscribe: () => {
        console.log(`[ElectricSync] Unsubscribing from ${shape.table}`);
        existingSubscription.unsubscribe();
        activeSubscriptions.delete(shapeKey);
      },
      subscription: existingSubscription,
    };
  }

  try {
    const subscription = await pglite.electric.syncShapeToTable({
      shape: {
        url: `${config.electricUrl}/v1/shape`,
        params: {
          table: shape.table,
          source_id: config.sourceId,
          secret: config.secret,
        },
      },
      table: shape.table,
      schema: shape.schema || "public",
      primaryKey: shape.primaryKey,
      shapeKey: shapeKey,
      initialInsertMethod: "json", // Required parameter

      // Callback when initial sync completes
      onInitialSync: () => {
        console.log(`[ElectricSync] ✅ Initial sync complete for ${shape.table}`);

        // Log current data count to verify sync worked
        pglite.query(`SELECT COUNT(*) as count FROM ${shape.table}`).then((result: any) => {
          console.log(`[ElectricSync] Table ${shape.table} now has ${result.rows[0]?.count || 0} records after initial sync`);
        }).catch((err: any) => {
          console.log(`[ElectricSync] Could not count records in ${shape.table}:`, err);
        });

        if (callbacks?.onDataChange) {
          console.log(`[ElectricSync] Triggering onDataChange callback for initial sync`);
          callbacks.onDataChange();
        }
      },
    });

    // Set up listener for ongoing changes
    if (callbacks?.onDataChange) {
      console.log(`[ElectricSync] Setting up change subscription for ${shape.table}`);
      subscription.subscribe(() => {
        console.log(`[ElectricSync] 🔄 Data changed for ${shape.table}, triggering callback`);

        // Log updated data count
        pglite.query(`SELECT COUNT(*) as count FROM ${shape.table}`).then((result: any) => {
          console.log(`[ElectricSync] Table ${shape.table} now has ${result.rows[0]?.count || 0} records after change`);
        }).catch((err: any) => {
          console.log(`[ElectricSync] Could not count records in ${shape.table}:`, err);
        });

        callbacks.onDataChange();
      }, (error: any) => {
        console.error(`[ElectricSync] ❌ Sync error for ${shape.table}:`, error);
      });
    } else {
      console.log(`[ElectricSync] No onDataChange callback provided for ${shape.table}`);
    }

    console.log(`[ElectricSync] Subscription created for ${shape.table}, isUpToDate:`, subscription.isUpToDate);

    // Store the subscription to prevent duplicates
    activeSubscriptions.set(shapeKey, subscription);

    return {
      isUpToDate: subscription.isUpToDate,
      unsubscribe: () => {
        console.log(`[ElectricSync] Unsubscribing from ${shape.table}`);
        subscription.unsubscribe();
        activeSubscriptions.delete(shapeKey);
      },
      subscription, // Include raw subscription for debugging
    };
  } catch (error) {
    console.error(`[ElectricSync] ❌ Failed to set up sync for table ${shape.table}:`, error);
    throw error;
  }
}

// Sync multiple shapes to multiple tables with transactional consistency
export async function syncShapesToTables(
  pglite: any,
  config: ElectricSyncConfig,
  shapes: Record<string, SyncShape>,
  syncKey = "ordo-sync"
): Promise<MultiSyncSubscription> {
  console.log(`[ElectricSync] Starting multi-table sync with key: ${syncKey}`);
  console.log(`[ElectricSync] Shapes to sync:`, Object.keys(shapes));

  const shapesConfig = Object.entries(shapes).reduce(
    (acc, [key, shape]) => {
      acc[key] = {
        shape: {
          url: `${config.electricUrl}/v1/shape`,
          params: {
            table: shape.table,
            source_id: config.sourceId,
            secret: config.secret,
          },
        },
        table: shape.table,
        schema: shape.schema || "public",
        primaryKey: shape.primaryKey,
      };
      return acc;
    },
    {} as Record<string, any>
  );

  try {
    const subscription = await pglite.electric.syncShapesToTables({
      shapes: shapesConfig,
      key: syncKey,
      initialInsertMethod: "json", // Use JSON for better performance
      onInitialSync: () => {
        console.log(`[ElectricSync] ✅ Initial sync complete for all shapes`);

        // Log counts for all tables
        Object.values(shapes).forEach(async (shape) => {
          try {
            const result = await pglite.query(`SELECT COUNT(*) as count FROM ${shape.table}`);
            console.log(`[ElectricSync] Table ${shape.table} now has ${result.rows[0]?.count || 0} records`);
          } catch (err) {
            console.error(`[ElectricSync] Error counting records in ${shape.table}:`, err);
          }
        });
      },
    });

    console.log(`[ElectricSync] Multi-table subscription created, isUpToDate:`, subscription.isUpToDate);

    return {
      isUpToDate: subscription.isUpToDate,
      unsubscribe: () => {
        console.log(`[ElectricSync] Unsubscribing from multi-table sync`);
        subscription.unsubscribe();
      },
      subscription, // Include raw subscription for debugging
    };
  } catch (error) {
    console.error(`[ElectricSync] ❌ Failed to set up multi-table sync:`, error);
    throw error;
  }
}

// Create a complete sync setup for the tasks table
export async function setupTasksSync(
  pglite: any,
  config: ElectricSyncConfig,
  callbacks?: {
    onDataChange?: () => void;
  }
): Promise<SyncSubscription> {
  console.log(`[ElectricSync] Setting up tasks table sync`);
  console.log(`[ElectricSync] Electric URL: ${config.electricUrl}`);

  // Check current local task count before sync
  try {
    const beforeResult = await pglite.query('SELECT COUNT(*) as count FROM tasks');
    console.log(`[ElectricSync] Local tasks before sync: ${beforeResult.rows[0]?.count || 0}`);

    // Also log some sample tasks if they exist
    const sampleResult = await pglite.query('SELECT id, title, created_at FROM tasks ORDER BY created_at DESC LIMIT 3');
    if (sampleResult.rows.length > 0) {
      console.log(`[ElectricSync] Sample local tasks:`, sampleResult.rows);
    }
  } catch (err) {
    console.log(`[ElectricSync] Could not count local tasks (table may not exist yet):`, err instanceof Error ? err.message : String(err));
  }

  return syncShapeToTable(pglite, config, {
    table: "tasks",
    primaryKey: ["id"],
    shapeKey: "tasks",
  }, callbacks);
}

// Utility to check if PGlite instance has Electric sync extension
export function hasElectricSync(pglite: any): pglite is any {
  return pglite && typeof pglite.electric !== "undefined";
}

// Utility to clear all active subscriptions (for debugging)
export function clearAllActiveSubscriptions(): void {
  console.log(`[ElectricSync] Clearing ${activeSubscriptions.size} active subscriptions`);
  for (const [key, subscription] of activeSubscriptions.entries()) {
    try {
      subscription.unsubscribe();
    } catch (error) {
      console.warn(`[ElectricSync] Error unsubscribing from ${key}:`, error);
    }
  }
  activeSubscriptions.clear();
}

// Create sync-enabled database with existing client
export function createSyncEnabledDatabase(pgliteClient: any) {
  // This would be used similarly to createDatabaseWithClient but with sync capabilities
  // The actual database creation logic would remain the same
  return pgliteClient;
}

// Simple utility to test sync connectivity
export async function testSyncConnectivity(config: ElectricSyncConfig): Promise<boolean> {
  try {
    const testUrl = new URL(`${config.electricUrl}/v1/shape`);
    testUrl.searchParams.set('table', 'tasks');
    testUrl.searchParams.set('source_id', config.sourceId);
    testUrl.searchParams.set('secret', config.secret);
    testUrl.searchParams.set('offset', '-1'); // Required for initial sync test

    console.log(`[ElectricSync] Testing connectivity to: ${config.electricUrl}/v1/shape (with auth params)`);

    const response = await fetch(testUrl.toString());
    const isConnected = response.ok;

    console.log(`[ElectricSync] Connectivity test result: ${isConnected ? 'SUCCESS' : 'FAILED'} (${response.status})`);

    if (!isConnected) {
      const errorData = await response.text();
      console.log(`[ElectricSync] Error response:`, errorData);
    } else {
      const responseData = await response.text();
      console.log(`[ElectricSync] Success response sample:`, responseData.substring(0, 200) + '...');
    }

    return isConnected;
  } catch (error) {
    console.error(`[ElectricSync] Connectivity test failed:`, error);
    return false;
  }
}

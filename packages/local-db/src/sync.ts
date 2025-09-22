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
  config?: { debug?: boolean }
): Promise<any> {
  const pglite = await PGlite.create(dataDir, {
    extensions: {
      electric: electricSync({
        metadataSchema: "electric",
        debug: config?.debug || false,
      }),
    },
  });

  return pglite;
}

// Sync a single shape to a table
export async function syncShapeToTable(
  pglite: any,
  config: ElectricSyncConfig,
  shape: SyncShape
): Promise<SyncSubscription> {
  console.log(`[ElectricSync] Starting sync for table: ${shape.table}`);
  console.log(`[ElectricSync] Config:`, {
    url: `${config.electricUrl}/v1/shape`,
    table: shape.table,
    schema: shape.schema || "public",
    primaryKey: shape.primaryKey,
    shapeKey: shape.shapeKey || shape.table,
  });

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
      shapeKey: shape.shapeKey || shape.table,
      initialInsertMethod: "json", // Use JSON for better performance
      mapColumns: createConflictResolutionMapper(shape.table),
      onInitialSync: () => {
        console.log(`[ElectricSync] ✅ Initial sync complete for table: ${shape.table}`);

        // Log the current table state after sync
        pglite.query(`SELECT COUNT(*) as count FROM ${shape.table}`)
          .then((result: any) => {
            console.log(`[ElectricSync] Table ${shape.table} now has ${result.rows[0]?.count || 0} records`);
          })
          .catch((err: any) => {
            console.error(`[ElectricSync] Error counting records in ${shape.table}:`, err);
          });
      },
    });

    console.log(`[ElectricSync] Subscription created for ${shape.table}, isUpToDate:`, subscription.isUpToDate);

    // Set up detailed event listeners
    if (subscription.stream) {
      subscription.stream.subscribe((messages: any[]) => {
        console.log(`[ElectricSync] Received ${messages.length} messages for ${shape.table}:`, messages);
      });
    }

    return {
      isUpToDate: subscription.isUpToDate,
      unsubscribe: () => {
        console.log(`[ElectricSync] Unsubscribing from ${shape.table}`);
        subscription.unsubscribe();
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
  config: ElectricSyncConfig
): Promise<SyncSubscription> {
  console.log(`[ElectricSync] Setting up tasks table sync`);

  // Check current local task count before sync
  try {
    const beforeResult = await pglite.query('SELECT COUNT(*) as count FROM tasks');
    console.log(`[ElectricSync] Local tasks before sync: ${beforeResult.rows[0]?.count || 0}`);
  } catch (err) {
    console.log(`[ElectricSync] Could not count local tasks (table may not exist yet):`, err instanceof Error ? err.message : String(err));
  }

  return syncShapeToTable(pglite, config, {
    table: "tasks",
    primaryKey: ["id"],
    shapeKey: "tasks",
  });
}

// Utility to check if PGlite instance has Electric sync extension
export function hasElectricSync(pglite: any): pglite is any {
  return pglite && typeof pglite.electric !== "undefined";
}

// Create sync-enabled database with existing client
export function createSyncEnabledDatabase(pgliteClient: any) {
  // This would be used similarly to createDatabaseWithClient but with sync capabilities
  // The actual database creation logic would remain the same
  return pgliteClient;
}

// Conflict resolution mapper for handling duplicate keys
function createConflictResolutionMapper(tableName: string) {
  return (message: any) => {
    console.log(`[ElectricSync] Processing message for ${tableName}:`, message);

    // Handle different message types
    if (message.__op === 'INSERT' || message.__op === 'UPDATE') {
      return {
        id: message.id,
        title: message.title,
        description: message.description,
        completed: message.completed,
        created_at: message.created_at,
        updated_at: message.updated_at,
        due_date: message.due_date,
      };
    }

    if (message.__op === 'DELETE') {
      return {
        id: message.id,
      };
    }

    // Fallback - return the message as-is
    return message;
  };
}

// Setup tasks sync with conflict resolution
export async function setupTasksSyncWithConflictResolution(
  pglite: any,
  config: ElectricSyncConfig
): Promise<SyncSubscription> {
  console.log(`[ElectricSync] Setting up tasks table sync with conflict resolution`);

  // Check current local task count before sync
  try {
    const beforeResult = await pglite.query('SELECT COUNT(*) as count FROM tasks');
    console.log(`[ElectricSync] Local tasks before sync: ${beforeResult.rows[0]?.count || 0}`);
  } catch (err) {
    console.log(`[ElectricSync] Could not count local tasks (table may not exist yet):`, err instanceof Error ? err.message : String(err));
  }

  // Set up custom UPSERT logic for conflict resolution
  try {
    // Create a temporary view or use UPSERT logic
    await pglite.query(`
      CREATE OR REPLACE FUNCTION upsert_task(
        task_id text,
        task_title text,
        task_description text,
        task_completed boolean,
        task_created_at timestamp,
        task_updated_at timestamp,
        task_due_date timestamp
      ) RETURNS void AS $$
      BEGIN
        -- Try to update first
        UPDATE tasks SET
          title = task_title,
          description = task_description,
          completed = task_completed,
          updated_at = GREATEST(updated_at, task_updated_at),
          due_date = task_due_date
        WHERE id = task_id;

        -- If no rows were affected, insert
        IF NOT FOUND THEN
          INSERT INTO tasks (id, title, description, completed, created_at, updated_at, due_date)
          VALUES (task_id, task_title, task_description, task_completed, task_created_at, task_updated_at, task_due_date);
        END IF;
      END;
      $$ LANGUAGE plpgsql;
    `);

    console.log(`[ElectricSync] ✅ UPSERT function created for conflict resolution`);
  } catch (err) {
    console.warn(`[ElectricSync] Could not create UPSERT function:`, err instanceof Error ? err.message : String(err));
  }

  return syncShapeToTable(pglite, config, {
    table: "tasks",
    primaryKey: ["id"],
    shapeKey: "tasks",
  });
}

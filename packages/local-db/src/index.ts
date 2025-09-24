import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import * as schema from "./schema/index.js";

// Re-export commonly used Drizzle functions
export { and, eq, not, or, sql } from "drizzle-orm";

// Type to accept both PGlite and PGliteWithLive
type PGliteClient = PGlite | unknown;

// Create database instance with existing PGlite client
export function createDatabaseWithClient(pgliteClient: PGliteClient) {
  return drizzle(pgliteClient as PGlite, { schema });
}

// Initialize database with configuration (for non-React environments)
export function initializeClient(dataDir = "idb://ordo-db") {
  return new PGlite(dataDir);
}

// Export types explicitly to avoid conflicts
export type { ChangeSet, TaskChange } from "./electric-sync.js";
// Export Electric sync functions (avoiding duplicate type exports)
export {
  startSync,
  updateSyncStatus,
  useSyncStatus,
  waitForInitialSyncDone,
} from "./electric-sync.js";
export * from "./migrate.js";
// Export all schema items for convenience
export * from "./schema/index.js";
export * from "./sync.js";
export * from "./test-sync.js";

// Export change utilities (avoiding duplicate type exports)
export {
  markTaskAsSynced,
  prepareTaskForSync,
  trackModifiedColumns,
} from "./utils/changes.js";
// Export utilities and migration functions
export * from "./utils.js";

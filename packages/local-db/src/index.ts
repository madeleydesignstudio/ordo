import { drizzle } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import * as schema from "./schema/index.js";

// Re-export commonly used Drizzle functions
export { eq, and, or, not, sql } from "drizzle-orm";

// Type to accept both PGlite and PGliteWithLive
type PGliteClient = PGlite | any;

// Create database instance with existing PGlite client
export function createDatabaseWithClient(pgliteClient: PGliteClient) {
  return drizzle(pgliteClient as any, { schema });
}

// Initialize database with configuration (for non-React environments)
export function initializeClient(dataDir = "idb://ordo-db") {
  return new PGlite(dataDir);
}

// Export all schema items for convenience
export * from "./schema/index.js";

// Export utilities and migration functions
export * from "./utils.js";
export * from "./migrate.js";
export * from "./sync.js";
export * from "./bidirectional-sync.js";

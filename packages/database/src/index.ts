import { drizzle } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import * as schema from "./schema/index.js";

// Type to accept both PGlite and PGliteWithLive
type PGliteClient = PGlite | any;

// Database configuration options
export interface DatabaseConfig {
  dataDir?: string;
}

// Create database instance with existing PGlite client
export function createDatabaseWithClient(pgliteClient: PGliteClient) {
  return drizzle(pgliteClient as any, { schema });
}

// Initialize database with configuration (for non-React environments)
export function initializeClient(config: DatabaseConfig = {}) {
  // Default to persistent storage in browser using IndexedDB
  const dataDir = config.dataDir || "idb://ordo-db";
  return new PGlite(dataDir);
}

// Export all schema items for convenience
export * from "./schema/index.js";

// Export utilities and migration functions
export * from "./utils.js";
export * from "./migrate.js";

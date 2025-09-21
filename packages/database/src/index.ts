import { drizzle } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import * as schema from "./schema/index.js";

// Type to accept both PGlite and PGliteWithLive
type PGliteClient = PGlite | any;

// Database configuration options
export interface DatabaseConfig {
  dataDir?: string;
  debug?: boolean;
}

// Create PGlite instance with persistent storage
// Use IndexedDB for browser persistence or file system for Node.js
let client: PGlite;

// Initialize database with configuration
export function initializeClient(config: DatabaseConfig = {}) {
  if (client) {
    return client;
  }

  // Default to persistent storage in browser using IndexedDB
  const dataDir = config.dataDir || "idb://ordo-db";

  client = new PGlite(dataDir);

  return client;
}

// Create database instance with existing PGlite client
export function createDatabaseWithClient(pgliteClient: PGliteClient) {
  return drizzle(pgliteClient as any, { schema });
}

// Initialize with default config
client = initializeClient();

// Create Drizzle database instance with schema
export const db = drizzle(client, { schema });

// Export the client for direct access if needed
export { client };

// Export all schema items for convenience
export * from "./schema/index.js";

// Export utilities and migration functions
export * from "./utils.js";
export * from "./migrate.js";

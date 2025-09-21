import { useEffect, useState, useRef } from "react";
import { usePGlite } from "@electric-sql/pglite-react";
import {
  createDatabaseWithClient,
  runMigrations,
  healthCheck,
  clearDatabase,
  resetDatabase,
  tasks,
  type Task,
  type NewTask,
} from "@ordo/database";

export function useDatabase() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pgliteClient = usePGlite();
  const initRef = useRef(false);

  // Create database instance - wrap in try/catch for safety
  let db: any = null;
  try {
    db = createDatabaseWithClient(pgliteClient);
  } catch (err) {
    console.error("Failed to create database instance:", err);
    db = null;
  }

  useEffect(() => {
    // Prevent multiple initialization attempts
    if (initRef.current || !db) return;
    initRef.current = true;

    async function initializeDatabase() {
      try {
        setIsLoading(true);

        // Debug storage availability
        console.log("Checking IndexedDB availability...");
        if (!("indexedDB" in window)) {
          throw new Error("IndexedDB not available in this environment");
        }

        // Check if we can access the existing database
        try {
          const dbList = await indexedDB.databases();
          const existingDb = dbList.find((db) => db.name?.includes("ordo-db"));
          console.log(
            "Existing databases:",
            dbList.map((db) => db.name),
          );
          console.log("Found ordo-db:", !!existingDb);
        } catch (e) {
          console.log("Could not list databases:", e);
        }

        // Run migrations to set up schema
        console.log("Running migrations...");
        await runMigrations(pgliteClient);

        // Check database health and verify data persistence
        console.log("Checking database health...");
        const health = await healthCheck(db);
        if (health.status !== "healthy") {
          throw new Error(`Database unhealthy: ${health.error}`);
        }

        // Test data persistence by checking existing data
        console.log("Verifying data persistence...");
        const existingTasks = await db.select().from(tasks).limit(5);
        console.log(`Found ${existingTasks.length} existing tasks`);

        setIsInitialized(true);
        setError(null);
      } catch (err) {
        console.error("Failed to initialize database:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(`Database initialization failed: ${errorMessage}`);
        initRef.current = false; // Allow retry on error
      } finally {
        setIsLoading(false);
      }
    }

    // Add a small delay to ensure PGlite is ready
    setTimeout(initializeDatabase, 100);
  }, [db, pgliteClient]);

  return {
    db,
    isInitialized,
    isLoading,
    error,
    // Re-export schema and types for convenience
    tasks,
    // Utility functions for development - bound to current db instance
    clearDatabase: db ? () => clearDatabase(db) : () => Promise.resolve(),
    resetDatabase: () => resetDatabase(pgliteClient),
  };
}

// Export types for use in components
export type { Task, NewTask };

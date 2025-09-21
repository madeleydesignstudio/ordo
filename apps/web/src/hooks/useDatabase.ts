import { useEffect, useState, useRef } from "react";
import { usePGlite } from "@electric-sql/pglite-react";
import {
  createDatabaseWithClient,
  runMigrations,
  seedDatabase,
  healthCheck,
  clearDatabase,
  resetDatabase,
  users,
  tasks,
  type User,
  type Task,
  type NewUser,
  type NewTask,
} from "@ordo/database";

export function useDatabase() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pgliteClient = usePGlite();
  const db = createDatabaseWithClient(pgliteClient);
  const initRef = useRef(false);

  useEffect(() => {
    // Prevent multiple initialization attempts
    if (initRef.current) return;
    initRef.current = true;

    async function initializeDatabase() {
      try {
        setIsLoading(true);

        // Run migrations to set up schema
        await runMigrations(pgliteClient);

        // Check database health
        const health = await healthCheck(db);
        if (health.status !== "healthy") {
          throw new Error(`Database unhealthy: ${health.error}`);
        }

        // Seed database with initial data (only if empty)
        await seedDatabase(db);

        setIsInitialized(true);
        setError(null);
      } catch (err) {
        console.error("Failed to initialize database:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        initRef.current = false; // Allow retry on error
      } finally {
        setIsLoading(false);
      }
    }

    initializeDatabase();
  }, []);

  return {
    db,
    isInitialized,
    isLoading,
    error,
    // Re-export schema and types for convenience
    users,
    tasks,
    // Utility functions for development - bound to current db instance
    clearDatabase: () => clearDatabase(db),
    resetDatabase: () => resetDatabase(pgliteClient),
  };
}

// Export types for use in components
export type { User, Task, NewUser, NewTask };

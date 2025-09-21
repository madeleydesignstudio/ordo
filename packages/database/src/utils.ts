import { tasks } from "./schema/index.js";

/**
 * Clear all data from the database
 * Useful for testing or development
 */
export async function clearDatabase(db: any) {
  if (!db) {
    throw new Error("Database instance is required to clear database");
  }
  try {
    await db.delete(tasks);
  } catch (error) {
    console.error("Failed to clear database:", error);
    throw error;
  }
}

/**
 * Health check for the database connection
 */
export async function healthCheck(db: any) {
  if (!db) {
    throw new Error("Database instance is required for health check");
  }
  try {
    await db.select().from(tasks).limit(1);
    return { status: "healthy", timestamp: new Date().toISOString() };
  } catch (error) {
    return {
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    };
  }
}

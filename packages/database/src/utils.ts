import { tasks } from "./schema/index.js";

/**
 * Clear all data from the database
 * Useful for testing or development
 */
export async function clearDatabase(db?: any) {
  // Use provided db or import the default one
  if (!db) {
    const { db: defaultDb } = await import("./index.js");
    db = defaultDb;
  }
  try {
    await db.delete(tasks);
    console.log("Database cleared successfully");
  } catch (error) {
    console.error("Failed to clear database:", error);
    throw error;
  }
}

/**
 * Health check for the database connection
 */
export async function healthCheck(db?: any) {
  // Use provided db or import the default one
  if (!db) {
    const { db: defaultDb } = await import("./index.js");
    db = defaultDb;
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

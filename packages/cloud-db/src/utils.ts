import { tasks } from "./schema/index";

export async function clearDatabase(db: any) {
  if (!db) throw new Error("Database instance is required to clear database");
  try {
    await db.delete(tasks);
  } catch (error) {
    console.error("Failed to clear database:", error);
    throw error;
  }
}

export async function healthCheck(db: any) {
  if (!db) throw new Error("Database instance is required for health check");
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

export async function testConnection(db: any) {
  try {
    const result = await db.execute("SELECT 1 as test");
    return { connected: true, result };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getTableStats(db: any) {
  try {
    const taskCount = await db.select().from(tasks);
    return {
      tasks: taskCount.length,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    };
  }
}

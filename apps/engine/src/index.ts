import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { initializeCloudDatabase, tasks as cloudTasks, eq, gte } from "@ordo/cloud-db";
import type { Task } from "@ordo/local-db";

const app = new Hono();

// Middleware
app.use("*", cors());
app.use("*", logger());



const cloudDbResult = initializeCloudDatabase({
  connectionString: process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL,
});

// Handle both possible return types
const cloudDb = "db" in cloudDbResult ? cloudDbResult.db : cloudDbResult;

// Health check endpoint
app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Helper function to process a single task
async function processSingleTask(
  task: Task,
  results: {
    created: number;
    updated: number;
    errors: Array<{ taskId: string; error: string }>;
  }
) {
  console.log(`🔍 Processing task: ${task.id} - "${task.title}"`);
  console.log("📅 Task dates:", {
    createdAt: task.createdAt,
    createdAtType: typeof task.createdAt,
    updatedAt: task.updatedAt,
    updatedAtType: typeof task.updatedAt,
    dueDate: task.dueDate,
    dueDateType: typeof task.dueDate,
  });

  // Check if task exists in cloud database
  const existing = await cloudDb
    .select()
    .from(cloudTasks)
    .where(eq(cloudTasks.id, task.id))
    .limit(1);

  if (existing.length === 0) {
    console.log(`➕ Creating new task: ${task.id}`);
    // Create new task
    await cloudDb.insert(cloudTasks).values({
      id: task.id,
      title: task.title,
      description: task.description,
      completed: task.completed,
      createdAt: task.createdAt instanceof Date ? task.createdAt : new Date(task.createdAt),
      updatedAt: task.updatedAt instanceof Date ? task.updatedAt : new Date(task.updatedAt),
      dueDate: task.dueDate
        ? task.dueDate instanceof Date
          ? task.dueDate
          : new Date(task.dueDate)
        : null,
    });
    results.created++;
    console.log(`✅ Created task: ${task.id}`);
  } else {
    // Update existing task if local version is newer
    const existingTask = existing[0];
    if (!existingTask) return;

    const localUpdated = new Date(task.updatedAt);
    const cloudUpdated = new Date(existingTask.updatedAt);

    if (localUpdated > cloudUpdated) {
      console.log(`📝 Updating task: ${task.id}`);
      await cloudDb
        .update(cloudTasks)
        .set({
          title: task.title,
          description: task.description,
          completed: task.completed,
          updatedAt: task.updatedAt instanceof Date ? task.updatedAt : new Date(task.updatedAt),
          dueDate: task.dueDate
            ? task.dueDate instanceof Date
              ? task.dueDate
              : new Date(task.dueDate)
            : null,
        })
        .where(eq(cloudTasks.id, task.id));
      results.updated++;
      console.log(`✅ Updated task: ${task.id}`);
    } else {
      console.log(`⏭️ Skipping task (not newer): ${task.id}`);
    }
  }
}

// Sync tasks from local to cloud
app.post("/sync/tasks", async (c) => {
  console.log("📥 Received sync request");
  try {
    const body = await c.req.json();
    console.log("📋 Request body:", { taskCount: body?.tasks?.length || 0 });
    const { tasks } = body as { tasks: Task[] };

    if (!Array.isArray(tasks)) {
      console.log("❌ Invalid request: tasks is not an array");
      return c.json({ error: "Tasks must be an array" }, 400);
    }

    console.log(`🔄 Processing ${tasks.length} tasks...`);

    const results = {
      created: 0,
      updated: 0,
      errors: [] as Array<{ taskId: string; error: string }>,
    };

    // Process each task
    for (const task of tasks) {
      try {
        await processSingleTask(task, results);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.log(`❌ Error processing task ${task.id}:`, errorMessage);
        results.errors.push({
          taskId: task.id,
          error: errorMessage,
        });
      }
    }

    console.log("📊 Sync completed:", results);
    return c.json({
      success: true,
      results,
      message: `Synced ${results.created + results.updated} tasks`,
    });
  } catch (error) {
    console.error("💥 Sync error:", error);
    return c.json(
      {
        error: "Failed to sync tasks",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

// Delete a specific task from cloud
app.delete("/sync/tasks/:id", async (c) => {
  console.log("🗑️ Received delete request");
  try {
    const taskId = c.req.param("id");
    console.log(`🗑️ Deleting task: ${taskId}`);

    const deletedTask = await cloudDb
      .delete(cloudTasks)
      .where(eq(cloudTasks.id, taskId))
      .returning();

    if (deletedTask.length === 0) {
      console.log(`❌ Task ${taskId} not found`);
      return c.json({ error: "Task not found" }, 404);
    }

    console.log(`✅ Successfully deleted task: ${taskId}`);
    return c.json({
      success: true,
      message: `Task ${taskId} deleted successfully`,
      deletedTask: deletedTask[0],
    });
  } catch (error) {
    console.error("💥 Delete error:", error);
    return c.json(
      {
        error: "Failed to delete task",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

// Get all tasks from cloud (for pulling updates)
app.get("/sync/tasks", async (c) => {
  try {
    const allTasks = await cloudDb.select().from(cloudTasks);

    return c.json({
      success: true,
      tasks: allTasks,
    });
  } catch (error) {
    console.error("Fetch error:", error);
    return c.json(
      {
        error: "Failed to fetch tasks",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

// Get tasks modified after a specific timestamp (for incremental sync)
app.get("/sync/tasks/since/:timestamp", async (c) => {
  try {
    const timestamp = c.req.param("timestamp");
    const since = new Date(timestamp);

    if (Number.isNaN(since.getTime())) {
      return c.json({ error: "Invalid timestamp format" }, 400);
    }

    const recentTasks = await cloudDb
      .select()
      .from(cloudTasks)
      .where(gte(cloudTasks.updatedAt, since));

    return c.json({
      success: true,
      tasks: recentTasks,
      since: timestamp,
    });
  } catch (error) {
    console.error("Incremental sync error:", error);
    return c.json(
      {
        error: "Failed to fetch recent tasks",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

// Export app for Bun
export default {
  port: process.env.PORT || 3001,
  fetch: app.fetch.bind(app),
};

console.log(`🚀 Sync backend running on port ${process.env.PORT || 3001}`);

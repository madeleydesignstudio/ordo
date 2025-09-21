// Database Usage Examples for Ordo Project
// Demonstrates both local-db (PGlite) and cloud-db (Supabase) usage

import {
  createDatabaseWithClient,
  initializeClient,
  runMigrations,
  healthCheck,
  clearDatabase,
  tasks as localTasks,
  eq,
  type Task,
} from "@ordo/local-db";

import {
  initializeCloudDatabase,
  initializeSupabaseClient,
  createDatabaseWithSupabase,
  tasks as cloudTasks,
  eq as cloudEq,
  type Task as CloudTask,
} from "@ordo/cloud-db";

import { PGlite } from "@electric-sql/pglite";
import { live } from "@electric-sql/pglite/live";

// ===========================================
// LOCAL DATABASE (PGlite) USAGE EXAMPLES
// ===========================================

async function localDatabaseExample() {
  console.log("=== Local Database (PGlite) Examples ===");

  // Method 1: Initialize PGlite client directly
  const localClient = initializeClient("idb://ordo-local");
  const localDb = createDatabaseWithClient(localClient);

  // Method 2: Using PGlite with live queries (for React apps)
  const liveClient = await PGlite.create("idb://ordo-live", {
    extensions: { live },
  });
  const liveDb = createDatabaseWithClient(liveClient);

  // Run migrations to set up schema
  await runMigrations(localClient);

  // Check database health
  const health = await healthCheck(localDb);
  console.log("Local DB Health:", health);

  // Create tasks
  const newTasks = await localDb
    .insert(localTasks)
    .values([
      {
        title: "Set up local database",
        description: "Configure PGlite for offline-first functionality",
        completed: false,
      },
      {
        title: "Test data persistence",
        description: "Verify data survives page refresh",
        completed: true,
      },
    ])
    .returning();

  console.log("Created local tasks:", newTasks);

  // Query tasks
  const allLocalTasks = await localDb.select().from(localTasks);
  console.log("All local tasks:", allLocalTasks);

  // Query with conditions
  const completedTasks = await localDb
    .select()
    .from(localTasks)
    .where(eq(localTasks.completed, true));
  console.log("Completed local tasks:", completedTasks);

  // Update a task
  const updatedTask = await localDb
    .update(localTasks)
    .set({ completed: true })
    .where(eq(localTasks.title, "Set up local database"))
    .returning();
  console.log("Updated local task:", updatedTask);

  // Delete a task
  await localDb.delete(localTasks).where(eq(localTasks.completed, true));
  console.log("Deleted completed tasks");

  return { localDb, localClient };
}

// ===========================================
// CLOUD DATABASE (Supabase) USAGE EXAMPLES
// ===========================================

async function cloudDatabaseExample() {
  console.log("\n=== Cloud Database (Supabase) Examples ===");

  // Method 1: Initialize with config object
  const cloudDb = initializeCloudDatabase({
    supabase: {
      url: process.env.SUPABASE_URL!,
      anonKey: process.env.SUPABASE_ANON_KEY!,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
  });

  // Method 2: Initialize with connection string
  if (process.env.DATABASE_URL) {
    const directDb = initializeCloudDatabase({
      connectionString: process.env.DATABASE_URL,
    });
  }

  // Method 3: Initialize Supabase client separately
  const supabaseClient = initializeSupabaseClient({
    url: process.env.SUPABASE_URL!,
    anonKey: process.env.SUPABASE_ANON_KEY!,
  });

  // For direct database operations, you'd need the database instance
  // Note: This example assumes you have the database instance
  const { db: supabaseDb } = createDatabaseWithSupabase({
    url: process.env.SUPABASE_URL!,
    anonKey: process.env.SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  });

  // Create cloud tasks (same schema as local)
  const newCloudTasks = await supabaseDb
    .insert(cloudTasks)
    .values([
      {
        title: "Deploy to production",
        description: "Set up cloud database and deploy app",
        completed: false,
      },
      {
        title: "Configure real-time sync",
        description: "Set up Supabase real-time subscriptions",
        completed: false,
      },
    ])
    .returning();

  console.log("Created cloud tasks:", newCloudTasks);

  // Query cloud tasks (identical API to local)
  const allCloudTasks = await supabaseDb.select().from(cloudTasks);
  console.log("All cloud tasks:", allCloudTasks);

  // Real-time subscriptions (Supabase-specific feature)
  const subscription = supabaseClient
    .channel("tasks-changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "tasks",
      },
      (payload) => {
        console.log("Task changed in real-time:", payload);
      }
    )
    .subscribe();

  // Clean up subscription
  setTimeout(() => subscription.unsubscribe(), 5000);

  return { supabaseDb, supabaseClient };
}

// ===========================================
// SYNC BETWEEN LOCAL AND CLOUD
// ===========================================

async function syncExample() {
  console.log("\n=== Sync Between Local and Cloud ===");

  // Initialize both databases
  const localClient = initializeClient("idb://ordo-sync");
  const localDb = createDatabaseWithClient(localClient);

  const cloudDb = initializeCloudDatabase({
    supabase: {
      url: process.env.SUPABASE_URL!,
      anonKey: process.env.SUPABASE_ANON_KEY!,
    },
  });

  // Sync from local to cloud
  async function syncLocalToCloud() {
    const localTasksList = await localDb.select().from(localTasks);

    for (const task of localTasksList) {
      // Check if task exists in cloud
      const existingCloudTask = await cloudDb
        .select()
        .from(cloudTasks)
        .where(cloudEq(cloudTasks.id, task.id))
        .limit(1);

      if (existingCloudTask.length === 0) {
        // Task doesn't exist in cloud, insert it
        await cloudDb.insert(cloudTasks).values(task);
        console.log(`Synced task to cloud: ${task.title}`);
      } else {
        // Task exists, update if local is newer
        const cloudTask = existingCloudTask[0];
        if (task.updatedAt > cloudTask.updatedAt) {
          await cloudDb.update(cloudTasks).set(task).where(cloudEq(cloudTasks.id, task.id));
          console.log(`Updated cloud task: ${task.title}`);
        }
      }
    }
  }

  // Sync from cloud to local
  async function syncCloudToLocal() {
    const cloudTasksList = await cloudDb.select().from(cloudTasks);

    for (const task of cloudTasksList) {
      // Check if task exists locally
      const existingLocalTask = await localDb
        .select()
        .from(localTasks)
        .where(eq(localTasks.id, task.id))
        .limit(1);

      if (existingLocalTask.length === 0) {
        // Task doesn't exist locally, insert it
        await localDb.insert(localTasks).values(task);
        console.log(`Synced task to local: ${task.title}`);
      } else {
        // Task exists, update if cloud is newer
        const localTask = existingLocalTask[0];
        if (task.updatedAt > localTask.updatedAt) {
          await localDb.update(localTasks).set(task).where(eq(localTasks.id, task.id));
          console.log(`Updated local task: ${task.title}`);
        }
      }
    }
  }

  // Bidirectional sync
  async function bidirectionalSync() {
    console.log("Starting bidirectional sync...");
    await syncLocalToCloud();
    await syncCloudToLocal();
    console.log("Sync completed!");
  }

  return { bidirectionalSync };
}

// ===========================================
// DEVELOPMENT UTILITIES
// ===========================================

async function developmentUtilities() {
  console.log("\n=== Development Utilities ===");

  const localClient = initializeClient("idb://ordo-dev");
  const localDb = createDatabaseWithClient(localClient);

  // Clear all data (keeps schema)
  await clearDatabase(localDb);
  console.log("Cleared local database");

  // Reset database (drops and recreates schema)
  const { resetDatabase } = await import("@ordo/local-db");
  await resetDatabase(localClient);
  console.log("Reset local database");

  // Health checks
  const localHealth = await healthCheck(localDb);
  console.log("Local database health:", localHealth);

  // For cloud database
  if (process.env.SUPABASE_URL) {
    const cloudDb = initializeCloudDatabase({
      supabase: {
        url: process.env.SUPABASE_URL,
        anonKey: process.env.SUPABASE_ANON_KEY!,
      },
    });

    const {
      healthCheck: cloudHealthCheck,
      testConnection,
      getTableStats,
    } = await import("@ordo/cloud-db");

    const cloudHealth = await cloudHealthCheck(cloudDb);
    const connection = await testConnection(cloudDb);
    const stats = await getTableStats(cloudDb);

    console.log("Cloud database health:", cloudHealth);
    console.log("Cloud connection test:", connection);
    console.log("Cloud table stats:", stats);
  }
}

// ===========================================
// TYPE SAFETY EXAMPLES
// ===========================================

function typeSafetyExamples() {
  console.log("\n=== Type Safety Examples ===");

  // Both packages export identical types
  function processTask(task: Task) {
    console.log(`Processing task: ${task.title}`);
    console.log(`Status: ${task.completed ? "Completed" : "Pending"}`);
    console.log(`Created: ${task.createdAt.toISOString()}`);
  }

  function processCloudTask(task: CloudTask) {
    // CloudTask is identical to Task - they're interchangeable
    processTask(task);
  }

  // Type-safe task creation
  const newTaskData = {
    title: "Example task",
    description: "This is a type-safe task creation example",
    completed: false,
    dueDate: new Date("2024-12-31"),
  };

  // Both packages will accept the same data structure
  console.log("Type-safe task data:", newTaskData);
}

// ===========================================
// ERROR HANDLING EXAMPLES
// ===========================================

async function errorHandlingExamples() {
  console.log("\n=== Error Handling Examples ===");

  try {
    const localClient = initializeClient("idb://ordo-error-test");
    const localDb = createDatabaseWithClient(localClient);

    // Attempt to run migrations
    await runMigrations(localClient);

    // Test invalid operations
    try {
      // This will fail if the task doesn't exist
      await localDb
        .update(localTasks)
        .set({ completed: true })
        .where(eq(localTasks.id, "non-existent-id"));
    } catch (error) {
      console.log("Handled update error:", error.message);
    }

    // Health check with error handling
    const health = await healthCheck(localDb);
    if (health.status !== "healthy") {
      console.log("Database is unhealthy:", health.error);
    }
  } catch (error) {
    console.error("Database initialization failed:", error);

    // Graceful fallback
    console.log("Falling back to memory-only storage...");
    const memoryClient = initializeClient(":memory:");
    const memoryDb = createDatabaseWithClient(memoryClient);
    await runMigrations(memoryClient);
  }
}

// ===========================================
// MAIN EXECUTION
// ===========================================

async function main() {
  console.log("🚀 Ordo Database Usage Examples");
  console.log("================================");

  try {
    // Run examples
    await localDatabaseExample();

    // Only run cloud examples if environment variables are set
    if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
      await cloudDatabaseExample();
      await syncExample();
    } else {
      console.log("\n⚠️  Cloud database examples skipped (missing environment variables)");
      console.log("Set SUPABASE_URL and SUPABASE_ANON_KEY to run cloud examples");
    }

    await developmentUtilities();
    typeSafetyExamples();
    await errorHandlingExamples();
  } catch (error) {
    console.error("❌ Example execution failed:", error);
  }

  console.log("\n✅ Examples completed!");
}

// Export for use in other files
export {
  localDatabaseExample,
  cloudDatabaseExample,
  syncExample,
  developmentUtilities,
  typeSafetyExamples,
  errorHandlingExamples,
  main,
};

// Run examples if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

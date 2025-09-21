import { users, tasks } from "./schema/index.js";
import { eq } from "drizzle-orm";
import type { PgDatabase } from "drizzle-orm/pg-core";
import type { PGlite } from "@electric-sql/pglite";

/**
 * Initialize the database with tables
 * This function should be called when the application starts
 */
export async function initializeDatabase(db?: any) {
  // Use provided db or import the default one
  if (!db) {
    const { db: defaultDb } = await import("./index.js");
    db = defaultDb;
  }
  try {
    // Run migrations or create tables
    // Note: With PGlite, you might need to create tables manually
    // or use Drizzle's push command for development
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw error;
  }
}

/**
 * Seed the database with initial data
 */
export async function seedDatabase(db?: any) {
  // Use provided db or import the default one
  if (!db) {
    const { db: defaultDb } = await import("./index.js");
    db = defaultDb;
  }
  try {
    // Check if users already exist
    const existingUsers = await db.select().from(users).limit(1);

    if (existingUsers.length === 0) {
      // Insert sample users
      let sampleUsers = [];

      try {
        sampleUsers = await db
          .insert(users)
          .values([
            {
              email: "admin@ordo.dev",
              name: "Admin User",
            },
            {
              email: "user@ordo.dev",
              name: "Regular User",
            },
          ])
          .returning();
      } catch (error) {
        // If users already exist due to race condition, fetch them instead
        console.log("Users might already exist, fetching existing users...");
        const adminUser = await db
          .select()
          .from(users)
          .where(eq(users.email, "admin@ordo.dev"))
          .limit(1);
        const regularUser = await db
          .select()
          .from(users)
          .where(eq(users.email, "user@ordo.dev"))
          .limit(1);

        if (adminUser[0] && regularUser[0]) {
          sampleUsers = [adminUser[0], regularUser[0]];
        } else {
          throw error; // Re-throw if it's a different error
        }
      }

      // Check if tasks already exist for these users
      const existingTasks = await db
        .select()
        .from(tasks)
        .where(eq(tasks.userId, sampleUsers[0]!.id))
        .limit(1);

      if (existingTasks.length === 0) {
        // Insert sample tasks
        await db.insert(tasks).values([
          {
            title: "Setup Drizzle ORM",
            description: "Initialize Drizzle ORM with PGlite for the project",
            userId: sampleUsers[0]!.id,
            completed: true,
          },
          {
            title: "Create user authentication",
            description: "Implement user login and registration",
            userId: sampleUsers[0]!.id,
          },
          {
            title: "Design dashboard UI",
            description: "Create the main dashboard interface",
            userId: sampleUsers[1]!.id,
          },
        ]);
      }

      console.log("Database seeded successfully");
    } else {
      console.log("Database already contains data, skipping seed");
    }
  } catch (error) {
    console.error("Failed to seed database:", error);
    throw error;
  }
}

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
    await db.delete(users);
    console.log("Database cleared successfully");
  } catch (error) {
    console.error("Failed to clear database:", error);
    throw error;
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string, db?: any) {
  // Use provided db or import the default one
  if (!db) {
    const { db: defaultDb } = await import("./index.js");
    db = defaultDb;
  }
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return result[0] || null;
}

/**
 * Get user with their tasks
 */
export async function getUserWithTasks(userId: string, db?: any) {
  // Use provided db or import the default one
  if (!db) {
    const { db: defaultDb } = await import("./index.js");
    db = defaultDb;
  }
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!user[0]) return null;

  const userTasks = await db
    .select()
    .from(tasks)
    .where(eq(tasks.userId, userId));

  return {
    ...user[0],
    tasks: userTasks,
  };
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
    await db.select().from(users).limit(1);
    return { status: "healthy", timestamp: new Date().toISOString() };
  } catch (error) {
    return {
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    };
  }
}

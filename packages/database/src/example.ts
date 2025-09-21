import {
  db,
  runMigrations,
  seedDatabase,
  getUserWithTasks,
  healthCheck,
} from "./index.js";
import { users, tasks } from "./schema/index.js";
import { eq } from "drizzle-orm";

/**
 * Example usage of the Ordo database package
 * This file demonstrates how to use the database with Drizzle ORM and PGlite
 */
export async function exampleUsage() {
  try {
    console.log("🚀 Starting Ordo database example...");

    // 1. Run migrations to set up the database schema
    console.log("📋 Running database migrations...");
    await runMigrations();

    // 2. Check database health
    console.log("🏥 Checking database health...");
    const health = await healthCheck();
    console.log("Health status:", health);

    // 3. Seed the database with initial data
    console.log("🌱 Seeding database...");
    await seedDatabase();

    // 4. Query users
    console.log("👥 Fetching all users...");
    const allUsers = await db.select().from(users);
    console.log("Users found:", allUsers);

    // 5. Query tasks
    console.log("📝 Fetching all tasks...");
    const allTasks = await db.select().from(tasks);
    console.log("Tasks found:", allTasks);

    // 6. Create a new user
    console.log("➕ Creating a new user...");
    const newUser = await db
      .insert(users)
      .values({
        email: "example@ordo.dev",
        name: "Example User",
      })
      .returning();
    console.log("New user created:", newUser[0]);

    // 7. Create a task for the new user
    console.log("📋 Creating a task for the new user...");
    const newTask = await db
      .insert(tasks)
      .values({
        title: "Learn Drizzle ORM",
        description: "Complete the Drizzle ORM tutorial and build a sample app",
        userId: newUser[0]!.id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Due in 7 days
      })
      .returning();
    console.log("New task created:", newTask[0]);

    // 8. Query user with their tasks using the utility function
    console.log("🔗 Fetching user with their tasks...");
    const userWithTasks = await getUserWithTasks(newUser[0]!.id);
    console.log("User with tasks:", JSON.stringify(userWithTasks, null, 2));

    // 9. Update a task
    console.log("✏️ Updating task...");
    const updatedTask = await db
      .update(tasks)
      .set({ completed: true })
      .where(eq(tasks.id, newTask[0]!.id))
      .returning();
    console.log("Updated task:", updatedTask[0]);

    // 10. Query completed tasks
    console.log("✅ Fetching completed tasks...");
    const completedTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.completed, true));
    console.log("Completed tasks:", completedTasks);

    // 11. Join query example
    console.log("🔗 Performing join query...");
    const tasksWithUsers = await db
      .select({
        taskId: tasks.id,
        taskTitle: tasks.title,
        taskCompleted: tasks.completed,
        userName: users.name,
        userEmail: users.email,
      })
      .from(tasks)
      .innerJoin(users, eq(tasks.userId, users.id));
    console.log("Tasks with users:", tasksWithUsers);

    console.log("✨ Example completed successfully!");
    return { success: true };
  } catch (error) {
    console.error("❌ Example failed:", error);
    throw error;
  }
}

/**
 * Run the example if this file is executed directly
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  exampleUsage()
    .then(() => {
      console.log("🎉 Example finished successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Example failed with error:", error);
      process.exit(1);
    });
}

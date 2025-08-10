import { config } from "dotenv";
import { db } from "./index.js";
import { usersTable, postsTable } from "./schema.js";

config({ path: ".env.local" });

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // Clear existing data
    console.log("🧹 Clearing existing data...");
    await db.delete(postsTable);
    await db.delete(usersTable);

    // Seed users
    console.log("👥 Creating users...");
    const users = await db
      .insert(usersTable)
      .values([
        {
          name: "John Doe",
          age: 30,
          email: "john.doe@example.com",
        },
        {
          name: "Jane Smith",
          age: 25,
          email: "jane.smith@example.com",
        },
        {
          name: "Bob Johnson",
          age: 35,
          email: "bob.johnson@example.com",
        },
      ])
      .returning();

    console.log(`✅ Created ${users.length} users`);

    // Seed posts
    console.log("📝 Creating posts...");
    const posts = await db
      .insert(postsTable)
      .values([
        {
          title: "Getting Started with Drizzle ORM",
          content:
            "Drizzle ORM is a TypeScript ORM that helps you build type-safe database applications...",
          userId: users[0].id,
        },
        {
          title: "Building Modern Web Applications",
          content:
            "Modern web development requires careful consideration of performance, scalability, and user experience...",
          userId: users[0].id,
        },
        {
          title: "Database Design Best Practices",
          content:
            "When designing databases, it's important to consider normalization, indexing, and query performance...",
          userId: users[1].id,
        },
        {
          title: "TypeScript Tips and Tricks",
          content:
            "TypeScript provides powerful type checking capabilities that can help prevent runtime errors...",
          userId: users[1].id,
        },
        {
          title: "Supabase and PostgreSQL",
          content:
            "Supabase provides a powerful PostgreSQL database with real-time capabilities...",
          userId: users[2].id,
        },
      ])
      .returning();

    console.log(`✅ Created ${posts.length} posts`);
    console.log("🎉 Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

// Run the seed function
if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
    .then(() => {
      console.log("🏁 Seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Seeding failed:", error);
      process.exit(1);
    });
}

export { seed };

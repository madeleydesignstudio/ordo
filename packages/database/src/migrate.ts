import { PGlite } from "@electric-sql/pglite";

// Type to accept both PGlite and PGliteWithLive
type PGliteClient = PGlite | any;

/**
 * Run database migrations for PGlite
 * Since PGlite doesn't support traditional migrations out of the box,
 * we'll use raw SQL to create our tables
 */
export async function runMigrations(client?: PGliteClient) {
  // Use provided client or import the default one
  if (!client) {
    const { client: defaultClient } = await import("./index.js");
    client = defaultClient;
  }
  try {
    // Create users table
    await client.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
        is_active BOOLEAN DEFAULT TRUE NOT NULL
      );
    `);

    // Create tasks table
    await client.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT FALSE NOT NULL,
        user_id UUID NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
        due_date TIMESTAMP
      );
    `);

    // Create indexes for better performance
    await client.exec(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
      CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
      CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
    `);

    // Create trigger to update updated_at automatically
    await client.exec(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';

      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
      CREATE TRIGGER update_tasks_updated_at
        BEFORE UPDATE ON tasks
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    console.log("Database migrations completed successfully");
    return { success: true };
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

/**
 * Drop all tables (useful for testing)
 */
export async function dropTables(client?: PGliteClient) {
  // Use provided client or import the default one
  if (!client) {
    const { client: defaultClient } = await import("./index.js");
    client = defaultClient;
  }
  try {
    await client.exec(`
      DROP TABLE IF EXISTS tasks CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
    `);

    console.log("All tables dropped successfully");
    return { success: true };
  } catch (error) {
    console.error("Failed to drop tables:", error);
    throw error;
  }
}

/**
 * Reset database (drop and recreate)
 */
export async function resetDatabase(client?: PGliteClient) {
  await dropTables(client);
  await runMigrations(client);
  console.log("Database reset completed");
}

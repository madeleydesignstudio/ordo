import type { PGlite } from "@electric-sql/pglite";

// Type to accept both PGlite and PGliteWithLive
type PGliteClient = PGlite | any;

/**
 * Check if we need to migrate from the old schema
 */
async function needsMigration(client: PGliteClient): Promise<boolean> {
  try {
    // Check if the old schema exists (with user_id column)
    const result = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'tasks' AND column_name = 'user_id'
    `);
    return result.rows.length > 0;
  } catch (_error) {
    // If table doesn't exist at all, no migration needed
    return false;
  }
}

/**
 * Run database migrations for PGlite
 * Since PGlite doesn't support traditional migrations out of the box,
 * we'll use raw SQL to create our tables
 */
export async function runMigrations(client: PGliteClient) {
  if (!client) {
    throw new Error("PGlite client is required for migrations");
  }
  try {
    // Check if we need to migrate from old schema
    if (await needsMigration(client)) {
      await dropTables(client);
    }

    // Create tasks table with new simplified schema
    await client.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT FALSE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
        due_date TIMESTAMP
      );
    `);

    // Create indexes for better performance
    await client.exec(`
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

      DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
      CREATE TRIGGER update_tasks_updated_at
        BEFORE UPDATE ON tasks
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    return { success: true };
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

/**
 * Drop all tables (useful for testing)
 */
export async function dropTables(client: PGliteClient) {
  if (!client) {
    throw new Error("PGlite client is required to drop tables");
  }
  try {
    await client.exec(`
      DROP TABLE IF EXISTS tasks CASCADE;
      DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
    `);

    return { success: true };
  } catch (error) {
    console.error("Failed to drop tables:", error);
    throw error;
  }
}

/**
 * Reset database (drop and recreate)
 */
export async function resetDatabase(client: PGliteClient) {
  await dropTables(client);
  await runMigrations(client);
}

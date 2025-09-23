import type { PGlite } from "@electric-sql/pglite";

// Type to accept both PGlite and PGliteWithLive
type PGliteClient = PGlite | any;

async function needsMigration(client: PGliteClient): Promise<boolean> {
  try {
    const result = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'tasks' AND column_name = 'user_id'
    `);
    return result.rows.length > 0;
  } catch {
    return false;
  }
}

export async function runMigrations(client: PGliteClient) {
  if (!client) throw new Error("PGlite client is required for migrations");
  try {
    if (await needsMigration(client)) await dropTables(client);

    await client.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT FALSE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
        due_date TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
      CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

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
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

export async function dropTables(client: PGliteClient) {
  if (!client) throw new Error("PGlite client is required to drop tables");
  try {
    await client.exec(`
      DROP TABLE IF EXISTS tasks CASCADE;
      DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
    `);
  } catch (error) {
    console.error("Failed to drop tables:", error);
    throw error;
  }
}

export async function resetDatabase(client: PGliteClient) {
  await dropTables(client);
  await runMigrations(client);
}

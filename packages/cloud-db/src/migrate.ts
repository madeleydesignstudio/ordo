import postgres from "postgres";

// Type to accept PostgreSQL client
type PostgresClient = postgres.Sql<{}>;

async function needsMigration(client: PostgresClient): Promise<boolean> {
  try {
    const result = await client`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'tasks' AND column_name = 'user_id'
    `;
    return result.length > 0;
  } catch {
    return false;
  }
}

export async function runMigrations(client: PostgresClient) {
  if (!client) throw new Error("PostgreSQL client is required for migrations");
  try {
    if (await needsMigration(client)) await dropTables(client);

    await client`
      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    `;
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

export async function dropTables(client: PostgresClient) {
  if (!client) throw new Error("PostgreSQL client is required to drop tables");
  try {
    await client`
      DROP TABLE IF EXISTS tasks CASCADE;
      DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
    `;
  } catch (error) {
    console.error("Failed to drop tables:", error);
    throw error;
  }
}

export async function resetDatabase(client: PostgresClient) {
  await dropTables(client);
  await runMigrations(client);
}

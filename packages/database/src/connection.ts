import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Factory function to create database instance with connection string
export function createDatabase(connectionString: string) {
  if (!connectionString) {
    throw new Error('DATABASE_URL is required');
  }

  const sql = neon(connectionString);
  return drizzle(sql, { schema });
}

// Default export for environments that have process.env (like scripts)
let db: ReturnType<typeof createDatabase>;

try {
  // This will work in Node.js environments (like scripts)
  if (typeof process !== 'undefined' && process.env?.DATABASE_URL) {
    db = createDatabase(process.env.DATABASE_URL);
  }
} catch (error) {
  // Will be created when needed in Workers environment
}

export { db }; 
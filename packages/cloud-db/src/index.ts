import { drizzle } from "drizzle-orm/postgres-js";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import postgres from "postgres";
import * as schema from "./schema/index";

// Re-export commonly used Drizzle functions
export { eq, and, or, not, sql, gte } from "drizzle-orm";

// Supabase configuration interface
export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
}

// Database configuration options
export interface CloudDatabaseConfig {
  supabase?: SupabaseConfig;
  connectionString?: string;
}

// Create database instance with Supabase config
export function createDatabaseWithSupabase(config: SupabaseConfig) {
  const supabaseClient = createClient(config.url, config.anonKey);

  // Extract connection details from Supabase URL
  const url = new URL(config.url);
  const host = url.hostname.replace(".supabase.co", ".pooler.supabase.com");

  // Use service role key for direct database connection
  const dbUrl = `postgresql://postgres:${config.serviceRoleKey || config.anonKey}@${host}:5432/postgres?sslmode=require`;
  const client = postgres(dbUrl);

  return { db: drizzle(client, { schema }), supabaseClient };
}

// Create database instance with direct PostgreSQL connection
export function createDatabaseWithConnectionString(connectionString: string) {
  const client = postgres(connectionString);
  return drizzle(client, { schema });
}

// Initialize Supabase client
export function initializeSupabaseClient(config: SupabaseConfig) {
  return createClient(config.url, config.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

// Initialize database with configuration
export function initializeCloudDatabase(config: CloudDatabaseConfig) {
  if (config.supabase) {
    return createDatabaseWithSupabase(config.supabase);
  }

  if (config.connectionString) {
    return createDatabaseWithConnectionString(config.connectionString);
  }

  throw new Error("Either Supabase config or connection string is required");
}

// Export all schema items for convenience
export * from "./schema/index";

// Export utilities and migration functions
export * from "./utils";
export * from "./migrate";

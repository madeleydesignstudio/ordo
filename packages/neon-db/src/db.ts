import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

import * as schema from "./schema/index";

export function createDb(connectionString: string) {
  const sql = neon(connectionString);
  return drizzle(sql, { schema, casing: "snake_case" });
}

// For backwards compatibility, export a default instance that uses process.env
// This will only work in Node.js environments, not Cloudflare Workers
export const db = typeof process !== 'undefined' && process.env?.DATABASE_URL 
  ? createDb(process.env.DATABASE_URL) 
  : null;

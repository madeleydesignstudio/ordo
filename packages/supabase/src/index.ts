// Export database connection
export { db } from "./db/index.js";

// Export schema tables and types
export {
  usersTable,
  postsTable,
  type InsertUser,
  type SelectUser,
  type InsertPost,
  type SelectPost,
} from "./db/schema.js";

// Export seed function for programmatic use
export { seed } from "./db/seed.js";

// Re-export common Drizzle ORM functions for convenience
export {
  eq,
  ne,
  gt,
  gte,
  lt,
  lte,
  isNull,
  isNotNull,
  inArray,
  notInArray,
  like,
  ilike,
  and,
  or,
  not,
  desc,
  asc,
  sql,
} from "drizzle-orm";

// Re-export common Drizzle PostgreSQL functions
export {
  count,
  max,
  min,
  avg,
  sum,
} from "drizzle-orm";

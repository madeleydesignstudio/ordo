import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const todos = pgTable('todos', {
  id: text('id').primaryKey(), // Using text to match current PGlite setup
  name: text('name').notNull(),
  number: integer('number').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
  userId: text('user_id'), // Optional for local PGlite, required for cloud
});

export type Todo = typeof todos.$inferSelect;
export type NewTodo = typeof todos.$inferInsert;

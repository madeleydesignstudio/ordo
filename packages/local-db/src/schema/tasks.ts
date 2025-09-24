import { pgTable, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core";

export const tasks = pgTable("tasks", {
  id: text("id").primaryKey().$default(() => crypto.randomUUID()),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  completed: boolean("completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  dueDate: timestamp("due_date"),
  
  // Sync-related columns for Electric SQL
  synced: boolean("synced").default(false).notNull(),
  sentToServer: boolean("sent_to_server").default(false).notNull(),
  modifiedColumns: text("modified_columns"),
  deleted: boolean("deleted").default(false).notNull(),
  new: boolean("new").default(true).notNull(),
  username: varchar("username", { length: 255 }),
});

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;

import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { project } from "./projects.schema";

export const taskStatusEnum = pgEnum('task_status', ['todo', 'in_progress', 'done']);

export const task = pgTable("task", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  status: taskStatusEnum('status').notNull().default('todo'),
  dueDate: timestamp("due_date"),
  projectId: uuid("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

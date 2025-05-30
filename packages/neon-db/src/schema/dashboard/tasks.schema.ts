import { relations } from "drizzle-orm";
import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth.schema.js";
import { project } from "./projects.schema.js";

export const taskStatusEnum = pgEnum("task_status", ["todo", "in_progress", "done"]);

export const task = pgTable("task", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  status: taskStatusEnum("status").notNull().default("todo"),
  dueDate: timestamp("due_date"),
  projectId: uuid("project_id").references(() => project.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Relations: Task belongs to one project and one user
export const taskRelations = relations(task, ({ one }) => ({
  project: one(project, {
    fields: [task.projectId],
    references: [project.id],
  }),
  user: one(user, {
    fields: [task.userId],
    references: [user.id],
  }),
}));

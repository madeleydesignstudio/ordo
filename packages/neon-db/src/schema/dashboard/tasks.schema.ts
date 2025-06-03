import { relations } from "drizzle-orm";
import { pgEnum, pgTable, text, timestamp, uuid, json } from "drizzle-orm/pg-core";
import { user } from "./auth.schema";
import { project } from "./projects.schema";

export const taskStatusEnum = pgEnum("task_status", ["backlog", "todo", "in_progress", "done", "on_hold"]);
export const taskPriorityEnum = pgEnum("task_priority", ["low", "medium", "high", "urgent"]);

export const task = pgTable("task", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  startDate: timestamp("start_date"),
  dueDate: timestamp("due_date"),
  status: taskStatusEnum("status").notNull().default("backlog"),
  priority: taskPriorityEnum("priority").notNull().default("medium"),
  labels: json("labels").$type<string[]>().default([]),
  projectId: uuid("project_id").references(() => project.id, { onDelete: "set null" }),
  parentTaskId: uuid("parent_task_id"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Relations: Task belongs to one project (optional) and one user, Task can have parent/child tasks
export const taskRelations = relations(task, ({ one, many }) => ({
  project: one(project, {
    fields: [task.projectId],
    references: [project.id],
  }),
  user: one(user, {
    fields: [task.userId],
    references: [user.id],
  }),
  parentTask: one(task, {
    fields: [task.parentTaskId],
    references: [task.id],
    relationName: "TaskHierarchy",
  }),
  childTasks: many(task, {
    relationName: "TaskHierarchy",
  }),
}));

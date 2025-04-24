import { relations } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar
} from "drizzle-orm/pg-core";

// Project status enum
export const projectStatusEnum = pgEnum("project_status", [
  "not_started",
  "in_progress",
  "on_hold",
  "completed",
  "cancelled",
]);

// Task status enum
export const taskStatusEnum = pgEnum("task_status", [
  "todo",
  "in_progress",
  "in_review",
  "done",
]);

// Priority enum
export const priorityEnum = pgEnum("priority", [
  "low",
  "medium",
  "high",
  "urgent",
]);

// Projects table
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: projectStatusEnum("status").default("not_started").notNull(),
  startDate: timestamp("start_date").defaultNow(),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tasks table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: taskStatusEnum("status").default("todo").notNull(),
  priority: priorityEnum("priority").default("medium").notNull(),
  projectId: integer("project_id").references(() => projects.id, {
    onDelete: "cascade",
  }),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const projectsRelations = relations(projects, ({ many }) => ({
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
}));



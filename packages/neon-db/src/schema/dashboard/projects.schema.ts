import { relations } from "drizzle-orm";
import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth.schema";
import { task } from "./tasks.schema";

export const projectStatusEnum = pgEnum("project_status", ["backlog", "todo", "in_progress", "done", "on_hold"]);

export const project = pgTable("project", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon").default("📁"), // Default folder emoji
  cover: text("cover"), // URL to the cover/banner image
  startDate: timestamp("start_date"),
  dueDate: timestamp("due_date"),
  status: projectStatusEnum("status").notNull().default("backlog"),
  parentProjectId: uuid("parent_project_id"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Relations: Project belongs to one user, Project has many tasks, Project can have parent/child projects
export const projectRelations = relations(project, ({ one, many }) => ({
  user: one(user, {
    fields: [project.userId],
    references: [user.id],
  }),
  tasks: many(task),
  parentProject: one(project, {
    fields: [project.parentProjectId],
    references: [project.id],
    relationName: "ProjectHierarchy",
  }),
  childProjects: many(project, {
    relationName: "ProjectHierarchy",
  }),
}));

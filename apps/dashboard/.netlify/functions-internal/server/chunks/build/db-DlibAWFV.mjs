import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { relations } from 'drizzle-orm';
import { pgTable, timestamp, pgEnum, text, varchar, serial, integer } from 'drizzle-orm/pg-core';

function w(e) {
  if (Array.isArray(e)) return e.flatMap((H) => w(H));
  if (typeof e != "string") return [];
  const r = [];
  let t = 0, n, s, o, p, l;
  const i = () => {
    for (; t < e.length && /\s/.test(e.charAt(t)); ) t += 1;
    return t < e.length;
  }, g = () => (s = e.charAt(t), s !== "=" && s !== ";" && s !== ",");
  for (; t < e.length; ) {
    for (n = t, l = false; i(); ) if (s = e.charAt(t), s === ",") {
      for (o = t, t += 1, i(), p = t; t < e.length && g(); ) t += 1;
      t < e.length && e.charAt(t) === "=" ? (l = true, t = p, r.push(e.slice(n, o)), n = t) : t = o + 1;
    } else t += 1;
    (!l || t >= e.length) && r.push(e.slice(n, e.length));
  }
  return r;
}
function D(e) {
  return e instanceof Headers ? new Headers(e) : Array.isArray(e) ? new Headers(e) : typeof e == "object" ? new Headers(e) : new Headers();
}
function I(...e) {
  return e.reduce((r, t) => {
    const n = D(t);
    for (const [s, o] of n.entries()) s === "set-cookie" ? w(o).forEach((l) => r.append("set-cookie", l)) : r.set(s, o);
    return r;
  }, new Headers());
}
function F(e, r) {
  return new Response(JSON.stringify(e), { ...r, headers: I({ "content-type": "application/json" }, r == null ? void 0 : r.headers) });
}
const j = pgEnum("project_status", ["not_started", "in_progress", "on_hold", "completed", "cancelled"]), A = pgEnum("task_status", ["todo", "in_progress", "in_review", "done"]), N = pgEnum("priority", ["low", "medium", "high", "urgent"]), d = pgTable("projects", { id: serial("id").primaryKey(), name: varchar("name", { length: 255 }).notNull(), description: text("description"), status: j("status").default("not_started").notNull(), startDate: timestamp("start_date").defaultNow(), dueDate: timestamp("due_date"), createdAt: timestamp("created_at").defaultNow().notNull(), updatedAt: timestamp("updated_at").defaultNow().notNull() }), u = pgTable("tasks", { id: serial("id").primaryKey(), title: varchar("title", { length: 255 }).notNull(), description: text("description"), status: A("status").default("todo").notNull(), priority: N("priority").default("medium").notNull(), projectId: integer("project_id").references(() => d.id, { onDelete: "cascade" }), dueDate: timestamp("due_date"), createdAt: timestamp("created_at").defaultNow().notNull(), updatedAt: timestamp("updated_at").defaultNow().notNull() }), R = relations(d, ({ many: e }) => ({ tasks: e(u) })), x = relations(u, ({ one: e }) => ({ project: e(d, { fields: [u.projectId], references: [d.id] }) })), z = Object.freeze(Object.defineProperty({ __proto__: null, priorityEnum: N, projectStatusEnum: j, projects: d, projectsRelations: R, taskStatusEnum: A, tasks: u, tasksRelations: x }, Symbol.toStringTag, { value: "Module" }));
config({ path: ".env" });
const O = neon(process.env.DATABASE_URL), J = drizzle(O, { schema: z });

export { F, J, d, u };
//# sourceMappingURL=db-DlibAWFV.mjs.map

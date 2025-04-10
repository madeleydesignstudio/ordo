import { F, J, u, d } from './db-DlibAWFV.mjs';
import { eq } from 'drizzle-orm';
import { M } from '../nitro/nitro.mjs';
import 'drizzle-orm/neon-http';
import '@neondatabase/serverless';
import 'dotenv';
import 'drizzle-orm/pg-core';
import 'node:http';
import 'node:https';
import 'node:zlib';
import 'node:stream';
import 'node:buffer';
import 'node:util';
import 'node:url';
import 'node:net';
import 'node:fs';
import 'node:path';
import 'vinxi/lib/invariant';
import 'vinxi/lib/path';
import '@tanstack/react-router';
import 'node:async_hooks';
import 'react/jsx-runtime';
import 'react';
import 'class-variance-authority';
import 'lucide-react';
import 'clsx';
import 'tailwind-merge';
import '@radix-ui/react-slot';
import '@radix-ui/react-dialog';
import '@radix-ui/react-tooltip';
import '@radix-ui/react-accordion';
import '@radix-ui/react-separator';
import '@radix-ui/react-label';
import '@radix-ui/react-select';
import '@tanstack/react-query';
import 'cmdk';
import 'react-dom/server';
import 'node:stream/web';

const P = M("/api/projects/$projectSlug")({ GET: async ({ request: a, params: o }) => {
  try {
    const { projectSlug: t } = o, r = await J.query.projects.findFirst({ where: eq(d.id, parseInt(t, 10)), with: { tasks: true } });
    return r ? F(r) : F({ error: "Project not found" }, { status: 404 });
  } catch (t) {
    return console.error("Error fetching project:", t), F({ error: "Failed to fetch project" }, { status: 500 });
  }
}, POST: async ({ request: a, params: o }) => {
  try {
    const { projectSlug: t } = o, r = await a.json();
    if (!r.title) return F({ error: "Title is required" }, { status: 400 });
    if (!await J.query.projects.findFirst({ where: eq(d.id, parseInt(t, 10)) })) return F({ error: "Project not found" }, { status: 404 });
    const d$1 = await J.insert(u).values({ title: r.title, description: r.description || null, status: r.status || "todo", priority: r.priority || "medium", projectId: parseInt(t, 10), dueDate: r.dueDate ? new Date(r.dueDate) : null }).returning();
    return F({ task: d$1[0] }, { status: 201 });
  } catch (t) {
    return console.error("Error creating task:", t), F({ error: "Failed to create task" }, { status: 500 });
  }
}, DELETE: async ({ request: a, params: o }) => {
  try {
    const { projectSlug: t } = o, { searchParams: r } = new URL(a.url), c = r.get("taskId");
    return c ? (await J.delete(u).where(eq(u.id, parseInt(c, 10))).returning()).length === 0 ? F({ error: "Task not found" }, { status: 404 }) : F({ message: "Task deleted successfully" }) : (await J.delete(d).where(eq(d.id, parseInt(t, 10))).returning()).length === 0 ? F({ error: "Project not found" }, { status: 404 }) : F({ message: "Project deleted successfully" });
  } catch (t) {
    return console.error("Error deleting:", t), F({ error: "Failed to delete" }, { status: 500 });
  }
} });

export { P as APIRoute };
//# sourceMappingURL=_projectSlug.mjs.map

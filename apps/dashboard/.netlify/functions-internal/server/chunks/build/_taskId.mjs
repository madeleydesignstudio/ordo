import { F, J, u } from './db-DlibAWFV.mjs';
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

const D = M("/api/tasks/$taskId")({ GET: async ({ request: u$1, params: i }) => {
  try {
    const { taskId: e } = i, s = parseInt(e, 10);
    if (isNaN(s)) return F({ error: "Invalid task ID" }, { status: 400 });
    const t = await J.query.tasks.findFirst({ where: eq(u.id, s) });
    return t ? F(t) : F({ error: "Task not found" }, { status: 404 });
  } catch (e) {
    return console.error("Error fetching task:", e), F({ error: "Failed to fetch task" }, { status: 500 });
  }
}, PUT: async ({ request: u$1, params: i }) => {
  try {
    const { taskId: e } = i, s = parseInt(e, 10);
    if (isNaN(s)) return F({ error: "Invalid task ID" }, { status: 400 });
    const t = await u$1.json(), a = await J.query.tasks.findFirst({ where: eq(u.id, s) });
    if (!a) return F({ error: "Task not found" }, { status: 404 });
    const c = await J.update(u).set({ title: t.title || a.title, description: t.description !== void 0 ? t.description : a.description, status: t.status || a.status, priority: t.priority || a.priority, projectId: t.projectId ? parseInt(t.projectId, 10) : a.projectId, dueDate: t.dueDate ? new Date(t.dueDate) : a.dueDate, updatedAt: /* @__PURE__ */ new Date() }).where(eq(u.id, s)).returning();
    return F({ task: c[0] });
  } catch (e) {
    return console.error("Error updating task:", e), F({ error: "Failed to update task" }, { status: 500 });
  }
}, DELETE: async ({ request: u$1, params: i }) => {
  try {
    const { taskId: e } = i, s = parseInt(e, 10);
    return isNaN(s) ? F({ error: "Invalid task ID" }, { status: 400 }) : (await J.delete(u).where(eq(u.id, s)).returning()).length === 0 ? F({ error: "Task not found" }, { status: 404 }) : F({ message: "Task deleted successfully" });
  } catch (e) {
    return console.error("Error deleting task:", e), F({ error: "Failed to delete task" }, { status: 500 });
  }
} });

export { D as APIRoute };
//# sourceMappingURL=_taskId.mjs.map

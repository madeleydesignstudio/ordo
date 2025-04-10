import { F, J, u } from './db-DlibAWFV.mjs';
import { desc } from 'drizzle-orm';
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

const q = M("/api/tasks")({ GET: async ({ request: s }) => {
  try {
    const { searchParams: t } = new URL(s.url), e = t.get("projectId");
    let i = J.query.tasks.findMany({ orderBy: [desc(u.createdAt)] });
    e && (i = J.query.tasks.findMany({ where: (u, { eq: d }) => d(u.projectId, parseInt(e, 10)), orderBy: [desc(u.createdAt)] }));
    const c = await i;
    return F({ tasks: c });
  } catch (t) {
    return console.error("Error fetching tasks:", t), F({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}, POST: async ({ request: s }) => {
  try {
    const t = await s.json();
    if (!t.title) return F({ error: "Title is required" }, { status: 400 });
    if (!t.projectId) return F({ error: "Project ID is required" }, { status: 400 });
    const e = await J.insert(u).values({ title: t.title, description: t.description || null, status: t.status || "todo", priority: t.priority || "medium", projectId: parseInt(t.projectId, 10), dueDate: t.dueDate ? new Date(t.dueDate) : null }).returning();
    return F({ task: e[0] }, { status: 201 });
  } catch (t) {
    return console.error("Error creating task:", t), F({ error: "Failed to create task" }, { status: 500 });
  }
} });

export { q as APIRoute };
//# sourceMappingURL=tasks.mjs.map

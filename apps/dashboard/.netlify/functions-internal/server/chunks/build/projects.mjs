import { F, J, d } from './db-DlibAWFV.mjs';
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

const y = M("/api/projects")({ GET: async ({ request: o, params: t }) => {
  try {
    const r = await J.query.projects.findMany({ with: { tasks: true }, orderBy: [desc(d.createdAt)] });
    return F({ projects: r });
  } catch (r) {
    return console.error("Error fetching projects:", r), F({ error: "Failed to fetch projects" }, { status: 500 });
  }
}, POST: async ({ request: o }) => {
  try {
    const t = await o.json();
    if (!t.name) return F({ error: "Project name is required" }, { status: 400 });
    const r = await J.insert(d).values({ name: t.name, description: t.description || null, status: t.status || "not_started", startDate: t.startDate ? new Date(t.startDate) : /* @__PURE__ */ new Date(), dueDate: t.dueDate ? new Date(t.dueDate) : null }).returning();
    return F({ project: r[0] }, { status: 201 });
  } catch (t) {
    return console.error("Error creating project:", t), F({ error: "Failed to create project" }, { status: 500 });
  }
} });

export { y as APIRoute };
//# sourceMappingURL=projects.mjs.map

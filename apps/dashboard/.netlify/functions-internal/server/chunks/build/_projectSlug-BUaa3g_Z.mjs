import { jsx, jsxs } from 'react/jsx-runtime';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { $ as $t } from '../nitro/nitro.mjs';
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
import 'node:async_hooks';
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
import 'cmdk';
import 'react-dom/server';
import 'node:stream/web';

const Y = function() {
  const { projectSlug: s } = $t.useParams(), h = useNavigate(), [f, a] = useState(false), [i, l] = useState({ title: "", description: "" }), c = useQueryClient(), { data: n, isLoading: b, isError: y, error: g } = useQuery({ queryKey: ["project", s], queryFn: async () => {
    const e = await fetch(`/api/projects/${s}`);
    if (!e.ok) throw new Error("Failed to fetch project");
    return e.json();
  } }), d = useMutation({ mutationFn: async (e) => {
    const o = await fetch(`/api/projects/${s}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(e) });
    if (!o.ok) {
      const m = await o.json();
      throw new Error(m.error || "Failed to create task");
    }
    return o.json();
  }, onSuccess: () => {
    c.invalidateQueries({ queryKey: ["project", s] }), a(false), l({ title: "", description: "" });
  } }), x = useMutation({ mutationFn: async (e) => {
    const o = await fetch(`/api/projects/${s}?taskId=${e}`, { method: "DELETE" });
    if (!o.ok) {
      const m = await o.json();
      throw new Error(m.error || "Failed to delete task");
    }
    return o.json();
  }, onSuccess: () => {
    c.invalidateQueries({ queryKey: ["project", s] });
  } }), w = useMutation({ mutationFn: async () => {
    const e = await fetch(`/api/projects/${s}`, { method: "DELETE" });
    if (!e.ok) {
      const o = await e.json();
      throw new Error(o.error || "Failed to delete project");
    }
    return e.json();
  }, onSuccess: () => {
    c.invalidateQueries({ queryKey: ["projects"] }), h({ to: "/project-manager/projects" });
  } }), N = (e) => {
    e.preventDefault(), d.mutate(i);
  }, j = (e) => {
    window.confirm("Are you sure you want to delete this task?") && x.mutate(e);
  }, k = () => {
    window.confirm("Are you sure you want to delete this project? This will also delete all tasks associated with it.") && w.mutate();
  };
  return b ? jsx("div", { children: "Loading..." }) : y ? jsxs("div", { children: ["Error: ", g == null ? void 0 : g.message] }) : jsxs("div", { className: "p-6", children: [jsxs("div", { className: "flex justify-between items-center mb-4", children: [jsx("h1", { className: "text-2xl font-bold", children: n == null ? void 0 : n.name }), jsx("button", { onClick: k, className: "px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm", children: "Delete Project" })] }), jsx("p", { className: "mb-6", children: n == null ? void 0 : n.description }), jsxs("div", { className: "space-y-4", children: [jsxs("div", { className: "flex justify-between items-center", children: [jsx("h2", { className: "text-xl font-semibold", children: "Tasks" }), jsx("button", { onClick: () => a(true), className: "px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm", children: "Add Task" })] }), jsx("ul", { className: "space-y-2", children: (n == null ? void 0 : n.tasks.length) === 0 ? jsx("li", { className: "text-gray-500 italic", children: "No tasks yet. Create your first task!" }) : n == null ? void 0 : n.tasks.map((e) => jsxs("li", { className: "flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50", children: [jsxs("div", { className: "flex items-center gap-2", children: [jsx("input", { type: "checkbox", checked: e.completed, readOnly: true, className: "h-4 w-4" }), jsx("span", { className: e.completed ? "line-through text-gray-500" : "", children: e.title })] }), jsx("button", { onClick: () => j(e.id), className: "text-red-500 hover:text-red-700 text-sm", children: "Delete" })] }, e.id)) })] }), f && jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: jsxs("div", { className: "bg-white rounded-lg p-6 w-full max-w-md", children: [jsx("h2", { className: "text-xl font-bold mb-4", children: "Create New Task" }), jsxs("form", { onSubmit: N, children: [jsxs("div", { className: "mb-4", children: [jsx("label", { htmlFor: "title", className: "block text-sm font-medium text-gray-700 mb-1", children: "Task Title" }), jsx("input", { type: "text", id: "title", value: i.title, onChange: (e) => l({ ...i, title: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", required: true })] }), jsxs("div", { className: "mb-4", children: [jsx("label", { htmlFor: "description", className: "block text-sm font-medium text-gray-700 mb-1", children: "Description" }), jsx("textarea", { id: "description", value: i.description, onChange: (e) => l({ ...i, description: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", rows: 3 })] }), jsxs("div", { className: "flex justify-end gap-2", children: [jsx("button", { type: "button", onClick: () => a(false), className: "px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors", children: "Cancel" }), jsx("button", { type: "submit", className: "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors", disabled: d.isPending, children: d.isPending ? "Creating..." : "Create" })] })] })] }) })] });
};

export { Y as component };
//# sourceMappingURL=_projectSlug-BUaa3g_Z.mjs.map

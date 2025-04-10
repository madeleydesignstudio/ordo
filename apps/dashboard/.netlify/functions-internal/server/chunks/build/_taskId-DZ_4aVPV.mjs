import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { a as Et } from '../nitro/nitro.mjs';
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

const ee = function() {
  var _a, _b;
  const { taskId: l } = Et.useParams(), b = useNavigate(), d = useQueryClient(), [n, c] = useState(false), [a, u] = useState(null), { data: r, isLoading: f } = useQuery({ queryKey: ["task", l], queryFn: async () => {
    const t = await fetch(`/api/tasks/${l}`);
    if (!t.ok) throw new Error("Failed to fetch task");
    return t.json();
  } }), { data: x, isLoading: v } = useQuery({ queryKey: ["projects"], queryFn: async () => {
    const t = await fetch("/api/projects");
    if (!t.ok) throw new Error("Failed to fetch projects");
    return t.json();
  } }), m = useMutation({ mutationFn: async (t) => {
    const i = await fetch(`/api/tasks/${l}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(t) });
    if (!i.ok) {
      const D = await i.json();
      throw new Error(D.error || "Failed to update task");
    }
    return i.json();
  }, onSuccess: () => {
    d.invalidateQueries({ queryKey: ["task", l] }), d.invalidateQueries({ queryKey: ["tasks"] }), c(false);
  } }), N = useMutation({ mutationFn: async () => {
    const t = await fetch(`/api/tasks/${l}`, { method: "DELETE" });
    if (!t.ok) {
      const i = await t.json();
      throw new Error(i.error || "Failed to delete task");
    }
    return t.json();
  }, onSuccess: () => {
    d.invalidateQueries({ queryKey: ["tasks"] }), b({ to: "/project-manager/inbox" });
  } });
  useEffect(() => {
    r && u(r);
  }, [r]);
  const w = () => {
    c(true);
  }, k = () => {
    r && u(r), c(false);
  }, j = () => {
    a && m.mutate(a);
  }, C = () => {
    window.confirm("Are you sure you want to delete this task?") && N.mutate();
  }, s = (t, i) => {
    a && u({ ...a, [t]: i });
  };
  return f || v ? jsx("div", { className: "p-6", children: "Loading..." }) : r ? jsxs("div", { className: "p-6 max-w-3xl mx-auto", children: [jsxs("div", { className: "flex justify-between items-center mb-6", children: [jsx("h1", { className: "text-2xl font-bold", children: "Task Details" }), jsx("div", { className: "flex gap-2", children: n ? jsxs(Fragment, { children: [jsx("button", { onClick: k, className: "px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors", children: "Cancel" }), jsx("button", { onClick: j, className: "px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors", disabled: m.isPending, children: m.isPending ? "Saving..." : "Save" })] }) : jsxs(Fragment, { children: [jsx("button", { onClick: w, className: "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors", children: "Edit" }), jsx("button", { onClick: C, className: "px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors", children: "Delete" })] }) })] }), jsxs("div", { className: "space-y-6", children: [jsxs("div", { children: [jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Title" }), n ? jsx("input", { type: "text", value: (a == null ? void 0 : a.title) || "", onChange: (t) => s("title", t.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" }) : jsx("p", { className: "text-lg", children: r.title })] }), jsxs("div", { children: [jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Description" }), n ? jsx("textarea", { value: (a == null ? void 0 : a.description) || "", onChange: (t) => s("description", t.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", rows: 4 }) : jsx("p", { className: "text-gray-600", children: r.description || "No description" })] }), jsxs("div", { children: [jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Project" }), n ? jsxs("select", { value: (a == null ? void 0 : a.projectId) || "", onChange: (t) => s("projectId", t.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", children: [jsx("option", { value: "", children: "No Project" }), x == null ? void 0 : x.projects.map((t) => jsx("option", { value: t.id, children: t.name }, t.id))] }) : jsx("p", { className: "text-gray-600", children: ((_a = r.project) == null ? void 0 : _a.name) || "No project assigned" })] }), jsxs("div", { children: [jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Priority" }), n ? jsxs("select", { value: (a == null ? void 0 : a.priority) || "medium", onChange: (t) => s("priority", t.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", children: [jsx("option", { value: "low", children: "Low" }), jsx("option", { value: "medium", children: "Medium" }), jsx("option", { value: "high", children: "High" }), jsx("option", { value: "urgent", children: "Urgent" })] }) : jsx("span", { className: `px-2 py-1 rounded-full text-sm ${r.priority === "low" ? "bg-gray-200 text-gray-700" : r.priority === "medium" ? "bg-blue-200 text-blue-700" : r.priority === "high" ? "bg-orange-200 text-orange-700" : "bg-red-200 text-red-700"}`, children: r.priority })] }), jsxs("div", { children: [jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Due Date" }), n ? jsx("input", { type: "date", value: ((_b = a == null ? void 0 : a.dueDate) == null ? void 0 : _b.split("T")[0]) || "", onChange: (t) => s("dueDate", t.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" }) : jsx("p", { className: "text-gray-600", children: r.dueDate ? new Date(r.dueDate).toLocaleDateString() : "No due date" })] }), jsxs("div", { children: [jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Status" }), n ? jsxs("select", { value: (a == null ? void 0 : a.status) || "pending", onChange: (t) => s("status", t.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", children: [jsx("option", { value: "pending", children: "Pending" }), jsx("option", { value: "in_progress", children: "In Progress" }), jsx("option", { value: "completed", children: "Completed" })] }) : jsx("span", { className: `px-2 py-1 rounded-full text-sm ${r.status === "completed" ? "bg-green-200 text-green-700" : r.status === "in_progress" ? "bg-yellow-200 text-yellow-700" : "bg-gray-200 text-gray-700"}`, children: r.status.replace("_", " ") })] }), jsxs("div", { className: "pt-4 border-t", children: [jsxs("p", { className: "text-sm text-gray-500", children: ["Created: ", new Date(r.createdAt).toLocaleString()] }), jsxs("p", { className: "text-sm text-gray-500", children: ["Last updated: ", new Date(r.updatedAt).toLocaleString()] })] })] })] }) : jsx("div", { className: "p-6", children: "Task not found" });
};

export { ee as component };
//# sourceMappingURL=_taskId-DZ_4aVPV.mjs.map

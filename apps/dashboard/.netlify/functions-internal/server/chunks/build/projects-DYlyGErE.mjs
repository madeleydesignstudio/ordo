import { jsx, jsxs } from 'react/jsx-runtime';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { useState } from 'react';

const P = function() {
  const [l, o] = useState(false), [n, s] = useState({ name: "", description: "" }), d = useQueryClient(), { data: m, isLoading: u, isError: p, error: b } = useQuery({ queryKey: ["projects"], queryFn: async () => {
    const e = await fetch("/api/projects");
    if (!e.ok) throw new Error("Failed to fetch projects");
    return e.json();
  } }), a = useMutation({ mutationFn: async (e) => {
    const i = await fetch("/api/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(e) });
    if (!i.ok) {
      const g = await i.json();
      throw new Error(g.error || "Failed to create project");
    }
    return i.json();
  }, onSuccess: () => {
    d.invalidateQueries({ queryKey: ["projects"] }), o(false), s({ name: "", description: "" });
  } }), h = (e) => {
    e.preventDefault(), a.mutate(n);
  };
  return u ? jsx("div", { children: "Loading..." }) : p ? jsxs("div", { children: ["Error: ", b == null ? void 0 : b.message] }) : jsxs("div", { className: "p-4", children: [jsxs("div", { className: "flex justify-between items-center mb-6", children: [jsx("h1", { className: "text-2xl font-bold", children: "Projects" }), jsx("button", { onClick: () => o(true), className: "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors", children: "Create Project" })] }), jsx("div", { className: "grid gap-4", children: m == null ? void 0 : m.projects.map((e) => jsxs(Link, { to: "/project-manager/$projectSlug", params: { projectSlug: e.id }, className: "block p-4 border rounded-lg hover:bg-gray-50 transition-colors", children: [jsx("h2", { className: "text-lg font-bold", children: e.name }), jsx("p", { children: e.description }), jsxs("p", { className: "text-sm text-gray-500", children: ["Tasks: ", e.tasks.length] })] }, e.id)) }), l && jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: jsxs("div", { className: "bg-white rounded-lg p-6 w-full max-w-md", children: [jsx("h2", { className: "text-xl font-bold mb-4", children: "Create New Project" }), jsxs("form", { onSubmit: h, children: [jsxs("div", { className: "mb-4", children: [jsx("label", { htmlFor: "name", className: "block text-sm font-medium text-gray-700 mb-1", children: "Project Name" }), jsx("input", { type: "text", id: "name", value: n.name, onChange: (e) => s({ ...n, name: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", required: true })] }), jsxs("div", { className: "mb-4", children: [jsx("label", { htmlFor: "description", className: "block text-sm font-medium text-gray-700 mb-1", children: "Description" }), jsx("textarea", { id: "description", value: n.description, onChange: (e) => s({ ...n, description: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", rows: 3 })] }), jsxs("div", { className: "flex justify-end gap-2", children: [jsx("button", { type: "button", onClick: () => o(false), className: "px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors", children: "Cancel" }), jsx("button", { type: "submit", className: "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors", disabled: a.isPending, children: a.isPending ? "Creating..." : "Create" })] })] })] }) })] });
};

export { P as component };
//# sourceMappingURL=projects-DYlyGErE.mjs.map

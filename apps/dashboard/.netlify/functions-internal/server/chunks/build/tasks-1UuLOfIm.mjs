import { jsx, jsxs } from 'react/jsx-runtime';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';

const g = function() {
  const { data: i, isLoading: n, isError: s, error: o } = useQuery({ queryKey: ["tasks"], queryFn: async () => {
    const e = await fetch("/api/tasks");
    if (!e.ok) throw new Error("Failed to fetch tasks");
    return e.json();
  } });
  return n ? jsx("div", { className: "p-6", children: "Loading..." }) : s ? jsxs("div", { className: "p-6 text-red-500", children: ["Error: ", o == null ? void 0 : o.message] }) : jsxs("div", { className: "p-6", children: [jsx("h1", { className: "text-2xl font-bold mb-6", children: "All Tasks" }), (i == null ? void 0 : i.tasks.length) === 0 ? jsx("div", { className: "text-gray-500 italic", children: "No tasks found. Create a task in a project to see it here." }) : jsx("div", { className: "grid gap-4", children: i == null ? void 0 : i.tasks.map((e) => jsxs("div", { className: "p-4 border rounded-lg hover:bg-gray-50 transition-colors", children: [jsxs("div", { className: "flex justify-between items-start", children: [jsxs("div", { children: [jsx("h2", { className: "text-lg font-semibold", children: e.title }), e.description && jsx("p", { className: "text-gray-600 mt-1", children: e.description })] }), jsxs("div", { className: "flex items-center gap-2", children: [jsx("span", { className: `px-2 py-1 rounded-full text-xs ${e.status === "todo" ? "bg-gray-200 text-gray-700" : e.status === "in_progress" ? "bg-blue-200 text-blue-700" : e.status === "in_review" ? "bg-yellow-200 text-yellow-700" : "bg-green-200 text-green-700"}`, children: e.status.replace("_", " ") }), jsx("span", { className: `px-2 py-1 rounded-full text-xs ${e.priority === "low" ? "bg-gray-200 text-gray-700" : e.priority === "medium" ? "bg-blue-200 text-blue-700" : e.priority === "high" ? "bg-orange-200 text-orange-700" : "bg-red-200 text-red-700"}`, children: e.priority })] })] }), jsxs("div", { className: "mt-3 flex justify-between items-center text-sm text-gray-500", children: [jsx("div", { children: e.project && jsxs(Link, { to: "/project-manager/$projectSlug", params: { projectSlug: e.project.id.toString() }, className: "text-blue-600 hover:underline", children: ["Project: ", e.project.name] }) }), jsx("div", { children: e.dueDate && jsxs("span", { children: ["Due: ", new Date(e.dueDate).toLocaleDateString()] }) })] })] }, e.id)) })] });
};

export { g as component };
//# sourceMappingURL=tasks-1UuLOfIm.mjs.map

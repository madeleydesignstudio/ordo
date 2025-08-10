import { jsxs, jsx } from 'react/jsx-runtime';
import { B as Button } from './ssr.mjs';
import '@tanstack/react-router';
import '@tanstack/react-query';
import 'react';
import 'lucide-react';
import 'motion/react';
import 'react-dom';
import 'react-hotkeys-hook';
import 'date-fns';
import 'zod';
import 'node:async_hooks';
import '@tanstack/react-router/ssr/server';

const SplitComponent = function Projects() {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Project Manager" }),
      /* @__PURE__ */ jsx(Button, { children: "New Project" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-lg border bg-card p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold", children: "Website Redesign" }),
          /* @__PURE__ */ jsx("span", { className: "px-2 py-1 text-xs rounded-full bg-green-100 text-green-800", children: "In Progress" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mb-4", children: "Complete redesign of the company website with modern UI/UX principles." }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm", children: [
            /* @__PURE__ */ jsx("span", { children: "Progress" }),
            /* @__PURE__ */ jsx("span", { children: "65%" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: /* @__PURE__ */ jsx("div", { className: "bg-green-600 h-2 rounded-full", style: {
            width: "65%"
          } }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mt-4 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsx("span", { children: "Due: Dec 15, 2024" }),
          /* @__PURE__ */ jsx("span", { children: "5 tasks remaining" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-lg border bg-card p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold", children: "Mobile App" }),
          /* @__PURE__ */ jsx("span", { className: "px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800", children: "Planning" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mb-4", children: "Development of a cross-platform mobile application for the business." }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm", children: [
            /* @__PURE__ */ jsx("span", { children: "Progress" }),
            /* @__PURE__ */ jsx("span", { children: "20%" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: /* @__PURE__ */ jsx("div", { className: "bg-blue-600 h-2 rounded-full", style: {
            width: "20%"
          } }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mt-4 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsx("span", { children: "Due: Feb 28, 2025" }),
          /* @__PURE__ */ jsx("span", { children: "12 tasks remaining" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-lg border bg-card p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold", children: "Database Migration" }),
          /* @__PURE__ */ jsx("span", { className: "px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800", children: "On Hold" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mb-4", children: "Migrate legacy database to new cloud infrastructure." }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm", children: [
            /* @__PURE__ */ jsx("span", { children: "Progress" }),
            /* @__PURE__ */ jsx("span", { children: "40%" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: /* @__PURE__ */ jsx("div", { className: "bg-yellow-600 h-2 rounded-full", style: {
            width: "40%"
          } }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mt-4 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsx("span", { children: "Due: TBD" }),
          /* @__PURE__ */ jsx("span", { children: "8 tasks remaining" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rounded-lg border bg-card p-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold mb-4", children: "Project Timeline" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-4", children: [
          /* @__PURE__ */ jsx("div", { className: "w-3 h-3 bg-green-500 rounded-full" }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium", children: "Website Redesign - Phase 1 Complete" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Completed 2 days ago" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-4", children: [
          /* @__PURE__ */ jsx("div", { className: "w-3 h-3 bg-blue-500 rounded-full" }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium", children: "Mobile App - Requirements Gathering" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "In progress" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-4", children: [
          /* @__PURE__ */ jsx("div", { className: "w-3 h-3 bg-gray-400 rounded-full" }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium", children: "Database Migration - Planning Phase" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Scheduled for next week" })
          ] })
        ] })
      ] })
    ] })
  ] });
};

export { SplitComponent as component };
//# sourceMappingURL=index-0Mu0qjld.mjs.map

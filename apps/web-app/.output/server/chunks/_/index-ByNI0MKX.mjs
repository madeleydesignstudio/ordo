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

const SplitComponent = function Knowledge() {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Knowledge Base" }),
      /* @__PURE__ */ jsx(Button, { children: "Add Article" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold", children: "Categories" }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-lg border bg-card hover:bg-accent cursor-pointer", children: [
            /* @__PURE__ */ jsx("h3", { className: "font-medium", children: "Getting Started" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "5 articles" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-lg border bg-card hover:bg-accent cursor-pointer", children: [
            /* @__PURE__ */ jsx("h3", { className: "font-medium", children: "Best Practices" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "12 articles" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-lg border bg-card hover:bg-accent cursor-pointer", children: [
            /* @__PURE__ */ jsx("h3", { className: "font-medium", children: "Troubleshooting" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "8 articles" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-lg border bg-card hover:bg-accent cursor-pointer", children: [
            /* @__PURE__ */ jsx("h3", { className: "font-medium", children: "API Reference" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "15 articles" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "md:col-span-2 space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold", children: "Recent Articles" }),
          /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", children: "View All" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsx("div", { className: "p-4 rounded-lg border bg-card", children: /* @__PURE__ */ jsx("div", { className: "flex items-start justify-between", children: /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsx("h3", { className: "font-semibold hover:text-primary cursor-pointer", children: "How to Set Up Your First Project" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "A comprehensive guide to getting started with project management in Ordo." }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-4 mt-3 text-xs text-muted-foreground", children: [
              /* @__PURE__ */ jsx("span", { children: "Getting Started" }),
              /* @__PURE__ */ jsx("span", { children: "\u2022" }),
              /* @__PURE__ */ jsx("span", { children: "Updated 2 days ago" }),
              /* @__PURE__ */ jsx("span", { children: "\u2022" }),
              /* @__PURE__ */ jsx("span", { children: "5 min read" })
            ] })
          ] }) }) }),
          /* @__PURE__ */ jsx("div", { className: "p-4 rounded-lg border bg-card", children: /* @__PURE__ */ jsx("div", { className: "flex items-start justify-between", children: /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsx("h3", { className: "font-semibold hover:text-primary cursor-pointer", children: "Advanced Task Management Techniques" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Learn how to optimize your workflow with advanced task management features." }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-4 mt-3 text-xs text-muted-foreground", children: [
              /* @__PURE__ */ jsx("span", { children: "Best Practices" }),
              /* @__PURE__ */ jsx("span", { children: "\u2022" }),
              /* @__PURE__ */ jsx("span", { children: "Updated 1 week ago" }),
              /* @__PURE__ */ jsx("span", { children: "\u2022" }),
              /* @__PURE__ */ jsx("span", { children: "8 min read" })
            ] })
          ] }) }) }),
          /* @__PURE__ */ jsx("div", { className: "p-4 rounded-lg border bg-card", children: /* @__PURE__ */ jsx("div", { className: "flex items-start justify-between", children: /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsx("h3", { className: "font-semibold hover:text-primary cursor-pointer", children: "API Integration Guide" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Step-by-step instructions for integrating with external APIs and services." }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-4 mt-3 text-xs text-muted-foreground", children: [
              /* @__PURE__ */ jsx("span", { children: "API Reference" }),
              /* @__PURE__ */ jsx("span", { children: "\u2022" }),
              /* @__PURE__ */ jsx("span", { children: "Updated 2 weeks ago" }),
              /* @__PURE__ */ jsx("span", { children: "\u2022" }),
              /* @__PURE__ */ jsx("span", { children: "12 min read" })
            ] })
          ] }) }) })
        ] })
      ] })
    ] })
  ] });
};

export { SplitComponent as component };
//# sourceMappingURL=index-ByNI0MKX.mjs.map

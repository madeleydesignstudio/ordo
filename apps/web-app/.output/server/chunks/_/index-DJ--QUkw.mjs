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

const SplitComponent = function Journal() {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Journal" }),
      /* @__PURE__ */ jsx(Button, { children: "New Entry" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-6 md:grid-cols-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "md:col-span-2 space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "rounded-lg border bg-card p-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold", children: "Today's Reflection" }),
            /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground", children: "Dec 10, 2024" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mb-4", children: "Had a productive day working on the website redesign project. Made significant progress on the user interface components and received positive feedback from the team. Need to focus on the mobile responsiveness tomorrow." }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-4 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsx("span", { children: "\u{1F4DD} Daily Reflection" }),
            /* @__PURE__ */ jsx("span", { children: "\u2022" }),
            /* @__PURE__ */ jsx("span", { children: "2 hours ago" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-lg border bg-card p-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold", children: "Project Milestone Achieved" }),
            /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground", children: "Dec 9, 2024" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mb-4", children: "Successfully completed the first phase of the website redesign. The team is happy with the progress, and we're on track to meet our December deadline. Celebrating this small win before moving to the next phase." }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-4 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsx("span", { children: "\u{1F3AF} Milestone" }),
            /* @__PURE__ */ jsx("span", { children: "\u2022" }),
            /* @__PURE__ */ jsx("span", { children: "1 day ago" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-lg border bg-card p-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold", children: "Learning Note" }),
            /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground", children: "Dec 8, 2024" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mb-4", children: "Discovered a new React pattern for state management that could be useful for our current projects. The pattern uses custom hooks to encapsulate complex state logic and makes components more reusable." }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-4 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsx("span", { children: "\u{1F4A1} Learning" }),
            /* @__PURE__ */ jsx("span", { children: "\u2022" }),
            /* @__PURE__ */ jsx("span", { children: "2 days ago" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "rounded-lg border bg-card p-4", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-semibold mb-3", children: "Entry Types" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2 p-2 rounded hover:bg-accent cursor-pointer", children: [
              /* @__PURE__ */ jsx("span", { children: "\u{1F4DD}" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Daily Reflection" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2 p-2 rounded hover:bg-accent cursor-pointer", children: [
              /* @__PURE__ */ jsx("span", { children: "\u{1F3AF}" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Milestone" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2 p-2 rounded hover:bg-accent cursor-pointer", children: [
              /* @__PURE__ */ jsx("span", { children: "\u{1F4A1}" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Learning" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2 p-2 rounded hover:bg-accent cursor-pointer", children: [
              /* @__PURE__ */ jsx("span", { children: "\u{1F680}" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Goal" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2 p-2 rounded hover:bg-accent cursor-pointer", children: [
              /* @__PURE__ */ jsx("span", { children: "\u{1F50D}" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Analysis" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-lg border bg-card p-4", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-semibold mb-3", children: "This Month" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-sm", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { children: "Total Entries" }),
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: "18" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { children: "Streak Days" }),
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: "7" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { children: "Goals Achieved" }),
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: "3" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-lg border bg-card p-4", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-semibold mb-3", children: "Quick Actions" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", className: "w-full justify-start", children: "Daily Check-in" }),
            /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", className: "w-full justify-start", children: "Weekly Review" }),
            /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", className: "w-full justify-start", children: "Set New Goal" })
          ] })
        ] })
      ] })
    ] })
  ] });
};

export { SplitComponent as component };
//# sourceMappingURL=index-DJ--QUkw.mjs.map

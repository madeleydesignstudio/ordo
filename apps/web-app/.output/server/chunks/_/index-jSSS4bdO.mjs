import { jsxs, jsx } from 'react/jsx-runtime';
import { B as Button, S as Separator } from './ssr.mjs';
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

const SplitComponent = function Settings() {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Settings" }) }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-6 md:grid-cols-3", children: [
      /* @__PURE__ */ jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsxs("div", { className: "rounded-lg border bg-card p-4", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-semibold mb-3", children: "Settings Categories" }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsx("div", { className: "p-2 rounded hover:bg-accent cursor-pointer text-sm font-medium bg-accent", children: "General" }),
          /* @__PURE__ */ jsx("div", { className: "p-2 rounded hover:bg-accent cursor-pointer text-sm", children: "Appearance" }),
          /* @__PURE__ */ jsx("div", { className: "p-2 rounded hover:bg-accent cursor-pointer text-sm", children: "Notifications" }),
          /* @__PURE__ */ jsx("div", { className: "p-2 rounded hover:bg-accent cursor-pointer text-sm", children: "Keyboard Shortcuts" }),
          /* @__PURE__ */ jsx("div", { className: "p-2 rounded hover:bg-accent cursor-pointer text-sm", children: "Privacy & Security" }),
          /* @__PURE__ */ jsx("div", { className: "p-2 rounded hover:bg-accent cursor-pointer text-sm", children: "Integrations" }),
          /* @__PURE__ */ jsx("div", { className: "p-2 rounded hover:bg-accent cursor-pointer text-sm", children: "Advanced" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "md:col-span-2 space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "rounded-lg border bg-card p-6", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold mb-4", children: "Keyboard Shortcuts" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-3 rounded-lg border", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsx("p", { className: "font-medium", children: "Toggle Sidebar" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Open or close the navigation sidebar" })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "px-3 py-1 bg-muted rounded border text-sm font-mono", children: "\u2318 + S" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-3 rounded-lg border", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsx("p", { className: "font-medium", children: "Command Search" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Open the command palette to search and navigate" })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "px-3 py-1 bg-muted rounded border text-sm font-mono", children: "\u2318 + K" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-3 rounded-lg border", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsx("p", { className: "font-medium", children: "Toggle Focus Mode" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Hide all navigation elements for distraction-free work" })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "px-3 py-1 bg-muted rounded border text-sm font-mono", children: "\u2318 + F" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-lg border bg-card p-6", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold mb-4", children: "General Settings" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx("label", { className: "text-sm font-medium", children: "Display Name" }),
              /* @__PURE__ */ jsxs("div", { className: "flex space-x-2", children: [
                /* @__PURE__ */ jsx("input", { type: "text", placeholder: "Enter your name", className: "flex-1 px-3 py-2 text-sm border border-border rounded-md bg-background", defaultValue: "John Doe" }),
                /* @__PURE__ */ jsx(Button, { size: "sm", children: "Update" })
              ] })
            ] }),
            /* @__PURE__ */ jsx(Separator, {}),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx("label", { className: "text-sm font-medium", children: "Email Address" }),
              /* @__PURE__ */ jsxs("div", { className: "flex space-x-2", children: [
                /* @__PURE__ */ jsx("input", { type: "email", placeholder: "Enter your email", className: "flex-1 px-3 py-2 text-sm border border-border rounded-md bg-background", defaultValue: "john.doe@example.com" }),
                /* @__PURE__ */ jsx(Button, { size: "sm", children: "Update" })
              ] })
            ] }),
            /* @__PURE__ */ jsx(Separator, {}),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx("label", { className: "text-sm font-medium", children: "Timezone" }),
              /* @__PURE__ */ jsxs("select", { className: "w-full px-3 py-2 text-sm border border-border rounded-md bg-background", children: [
                /* @__PURE__ */ jsx("option", { children: "UTC-8 (Pacific Time)" }),
                /* @__PURE__ */ jsx("option", { children: "UTC-5 (Eastern Time)" }),
                /* @__PURE__ */ jsx("option", { children: "UTC+0 (Greenwich Mean Time)" }),
                /* @__PURE__ */ jsx("option", { children: "UTC+1 (Central European Time)" })
              ] })
            ] }),
            /* @__PURE__ */ jsx(Separator, {}),
            /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsx("label", { className: "text-sm font-medium", children: "Preferences" }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: "Enable notifications" }),
                    /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Receive updates about your projects" })
                  ] }),
                  /* @__PURE__ */ jsx("input", { type: "checkbox", defaultChecked: true, className: "rounded" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: "Auto-save drafts" }),
                    /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Automatically save your work" })
                  ] }),
                  /* @__PURE__ */ jsx("input", { type: "checkbox", defaultChecked: true, className: "rounded" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: "Dark mode" }),
                    /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Use dark theme" })
                  ] }),
                  /* @__PURE__ */ jsx("input", { type: "checkbox", className: "rounded" })
                ] })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-lg border bg-card p-6", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold mb-4", children: "Account Actions" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-4 rounded-lg border", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "font-medium", children: "Export Data" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Download all your data" })
              ] }),
              /* @__PURE__ */ jsx(Button, { variant: "outline", children: "Export" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-4 rounded-lg border", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "font-medium", children: "Reset Settings" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Restore default settings" })
              ] }),
              /* @__PURE__ */ jsx(Button, { variant: "outline", children: "Reset" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-4 rounded-lg border border-destructive/20", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "font-medium text-destructive", children: "Delete Account" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Permanently delete your account" })
              ] }),
              /* @__PURE__ */ jsx(Button, { variant: "destructive", children: "Delete" })
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
};

export { SplitComponent as component };
//# sourceMappingURL=index-jSSS4bdO.mjs.map

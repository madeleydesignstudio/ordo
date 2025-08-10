import { jsxs, jsx } from 'react/jsx-runtime';

const SplitComponent = function Notifications() {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Notifications" }) }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsx("div", { className: "rounded-lg border bg-card p-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start space-x-4", children: [
        /* @__PURE__ */ jsx("div", { className: "w-2 h-2 bg-blue-500 rounded-full mt-2" }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold", children: "Welcome to Ordo" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Your account has been successfully created. Get started by exploring the features." }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-2", children: "2 hours ago" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "rounded-lg border bg-card p-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start space-x-4", children: [
        /* @__PURE__ */ jsx("div", { className: "w-2 h-2 bg-green-500 rounded-full mt-2" }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold", children: "System Update" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "New features have been added to the knowledge base. Check them out now." }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-2", children: "1 day ago" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "rounded-lg border bg-card p-6 opacity-60", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start space-x-4", children: [
        /* @__PURE__ */ jsx("div", { className: "w-2 h-2 bg-gray-400 rounded-full mt-2" }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold", children: "Project Reminder" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Don't forget to review your project milestones this week." }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-2", children: "3 days ago" })
        ] })
      ] }) })
    ] })
  ] });
};

export { SplitComponent as component };
//# sourceMappingURL=index-DL_nALpg.mjs.map

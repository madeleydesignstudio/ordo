import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useEffect } from 'react';
import { u as useAuth } from './ssr.mjs';
import { useNavigate } from '@tanstack/react-router';
import 'stream';
import 'http';
import 'url';
import 'punycode';
import 'https';
import 'zlib';
import 'node:async_hooks';
import '@tanstack/react-router/ssr/server';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login" });
    }
  }, [user, loading, navigate]);
  if (loading) {
    return /* @__PURE__ */ jsx(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "1.125rem",
          color: "#6b7280"
        },
        children: "Loading..."
      }
    );
  }
  if (!user) {
    return null;
  }
  return /* @__PURE__ */ jsx(Fragment, { children });
}
function Navigation() {
  const { user, signOut } = useAuth();
  if (!user) {
    return null;
  }
  return /* @__PURE__ */ jsxs("nav", { style: {
    padding: "1rem 2rem",
    backgroundColor: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  }, children: [
    /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("h1", { style: { margin: 0, fontSize: "1.5rem", color: "#1f2937" }, children: "Ordo" }) }),
    /* @__PURE__ */ jsxs("div", { style: {
      display: "flex",
      alignItems: "center",
      gap: "1rem"
    }, children: [
      /* @__PURE__ */ jsxs("span", { style: { color: "#6b7280" }, children: [
        "Welcome, ",
        user.email
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: signOut,
          style: {
            padding: "0.5rem 1rem",
            backgroundColor: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "0.875rem"
          },
          children: "Sign Out"
        }
      )
    ] })
  ] });
}
const SplitComponent = function Home() {
  return /* @__PURE__ */ jsxs(ProtectedRoute, { children: [
    /* @__PURE__ */ jsx(Navigation, {}),
    /* @__PURE__ */ jsxs("main", { className: "p-8 max-w-6xl mx-auto", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-3xl mb-4 text-gray-800", children: "Welcome to Ordo" }),
      /* @__PURE__ */ jsx("p", { className: "text-lg text-gray-500 mb-8", children: "Your personal task management application." }),
      /* @__PURE__ */ jsxs("div", { className: "p-8 bg-white rounded-lg border border-gray-200", children: [
        /* @__PURE__ */ jsx("h2", { className: "mb-4 text-gray-700", children: "Dashboard" }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-500", children: "You are now successfully authenticated! Start building your task management features here." })
      ] })
    ] })
  ] });
};

export { SplitComponent as component };
//# sourceMappingURL=index-CLiQ8g0Y.mjs.map

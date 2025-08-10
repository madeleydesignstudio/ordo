import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { u as useAuth } from './ssr.mjs';
import { useState } from 'react';
import '@tanstack/react-router';
import 'stream';
import 'http';
import 'url';
import 'punycode';
import 'https';
import 'zlib';
import 'node:async_hooks';
import '@tanstack/react-router/ssr/server';

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error: error2 } = isSignUp ? await signUp(email, password) : await signIn(email, password);
      if (error2) {
        setError(error2.message);
      } else if (isSignUp) {
        setError("Check your email for the confirmation link!");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { style: {
    maxWidth: "400px",
    margin: "2rem auto",
    padding: "2rem",
    border: "1px solid #ddd",
    borderRadius: "8px",
    backgroundColor: "#fff"
  }, children: [
    /* @__PURE__ */ jsx("h2", { style: { textAlign: "center", marginBottom: "1.5rem" }, children: isSignUp ? "Sign Up" : "Sign In" }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
      /* @__PURE__ */ jsxs("div", { style: { marginBottom: "1rem" }, children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "email", style: { display: "block", marginBottom: "0.5rem" }, children: "Email" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            id: "email",
            type: "email",
            value: email,
            onChange: (e) => setEmail(e.target.value),
            required: true,
            style: {
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "1rem"
            }
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { marginBottom: "1.5rem" }, children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "password", style: { display: "block", marginBottom: "0.5rem" }, children: "Password" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            id: "password",
            type: "password",
            value: password,
            onChange: (e) => setPassword(e.target.value),
            required: true,
            style: {
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "1rem"
            }
          }
        )
      ] }),
      error && /* @__PURE__ */ jsx("div", { style: {
        color: isSignUp && error.includes("Check your email") ? "#059669" : "#dc2626",
        marginBottom: "1rem",
        fontSize: "0.875rem"
      }, children: error }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          disabled: loading,
          style: {
            width: "100%",
            padding: "0.75rem",
            backgroundColor: loading ? "#9ca3af" : "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontSize: "1rem",
            cursor: loading ? "not-allowed" : "pointer"
          },
          children: loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { style: { textAlign: "center", marginTop: "1rem" }, children: /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: () => {
          setIsSignUp(!isSignUp);
          setError("");
        },
        style: {
          background: "none",
          border: "none",
          color: "#3b82f6",
          cursor: "pointer",
          textDecoration: "underline"
        },
        children: isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"
      }
    ) })
  ] });
}
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return /* @__PURE__ */ jsx("div", { style: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      fontSize: "1.125rem",
      color: "#6b7280"
    }, children: "Loading..." });
  }
  if (!user) {
    return /* @__PURE__ */ jsx(LoginForm, {});
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
    /* @__PURE__ */ jsxs("main", { style: {
      padding: "2rem",
      maxWidth: "1200px",
      margin: "0 auto"
    }, children: [
      /* @__PURE__ */ jsx("h1", { style: {
        fontSize: "2rem",
        marginBottom: "1rem",
        color: "#1f2937"
      }, children: "Welcome to Ordo" }),
      /* @__PURE__ */ jsx("p", { style: {
        fontSize: "1.125rem",
        color: "#6b7280",
        marginBottom: "2rem"
      }, children: "Your personal task management application." }),
      /* @__PURE__ */ jsxs("div", { style: {
        padding: "2rem",
        backgroundColor: "white",
        borderRadius: "8px",
        border: "1px solid #e5e7eb"
      }, children: [
        /* @__PURE__ */ jsx("h2", { style: {
          marginBottom: "1rem",
          color: "#374151"
        }, children: "Dashboard" }),
        /* @__PURE__ */ jsx("p", { style: {
          color: "#6b7280"
        }, children: "You are now successfully authenticated! Start building your task management features here." })
      ] })
    ] })
  ] });
};

export { SplitComponent as component };
//# sourceMappingURL=index-BCYv1hhx.mjs.map

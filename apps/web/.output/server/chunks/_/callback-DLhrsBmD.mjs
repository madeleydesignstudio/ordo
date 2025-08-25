import { jsxs, jsx } from 'react/jsx-runtime';
import { useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { s as supabase } from './ssr.mjs';
import 'stream';
import 'http';
import 'url';
import 'punycode';
import 'https';
import 'zlib';
import 'node:async_hooks';
import '@tanstack/react-router/ssr/server';

const SplitComponent = function AuthCallback() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const {
          data,
          error: error2
        } = await supabase.auth.getSession();
        if (error2) {
          console.error("Auth callback error:", error2);
          setError(error2.message);
          return;
        }
        if (data.session) {
          navigate({
            to: "/"
          });
        } else {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get("access_token");
          const refreshToken = hashParams.get("refresh_token");
          if (accessToken && refreshToken) {
            const {
              error: sessionError
            } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });
            if (sessionError) {
              console.error("Session error:", sessionError);
              setError(sessionError.message);
              return;
            }
            navigate({
              to: "/"
            });
          } else {
            setError("Authentication failed. Please try again.");
            setTimeout(() => {
              navigate({
                to: "/"
              });
            }, 2e3);
          }
        }
      } catch (err) {
        console.error("Unexpected error during auth callback:", err);
        setError("An unexpected error occurred. Please try again.");
        setTimeout(() => {
          navigate({
            to: "/"
          });
        }, 2e3);
      } finally {
        setLoading(false);
      }
    };
    handleAuthCallback();
  }, [navigate]);
  if (loading) {
    return /* @__PURE__ */ jsxs("div", { style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      padding: "2rem"
    }, children: [
      /* @__PURE__ */ jsx("div", { style: {
        width: "40px",
        height: "40px",
        border: "4px solid #f3f4f6",
        borderTop: "4px solid #3b82f6",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
        marginBottom: "1rem"
      } }),
      /* @__PURE__ */ jsx("p", { style: {
        color: "#6b7280",
        fontSize: "1.125rem"
      }, children: "Completing authentication..." }),
      /* @__PURE__ */ jsx("style", { children: `
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          ` })
    ] });
  }
  if (error) {
    return /* @__PURE__ */ jsx("div", { style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      padding: "2rem"
    }, children: /* @__PURE__ */ jsxs("div", { style: {
      maxWidth: "400px",
      padding: "2rem",
      backgroundColor: "#fef2f2",
      border: "1px solid #fecaca",
      borderRadius: "8px",
      textAlign: "center"
    }, children: [
      /* @__PURE__ */ jsx("h2", { style: {
        color: "#dc2626",
        marginBottom: "1rem",
        fontSize: "1.25rem"
      }, children: "Authentication Error" }),
      /* @__PURE__ */ jsx("p", { style: {
        color: "#7f1d1d",
        marginBottom: "1.5rem"
      }, children: error }),
      /* @__PURE__ */ jsx("button", { onClick: () => navigate({
        to: "/login"
      }), style: {
        padding: "0.75rem 1.5rem",
        backgroundColor: "#dc2626",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        fontSize: "1rem"
      }, children: "Back to Login" })
    ] }) });
  }
  return null;
};

export { SplitComponent as component };
//# sourceMappingURL=callback-DLhrsBmD.mjs.map

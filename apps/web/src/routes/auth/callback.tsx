// src/routes/auth/callback.tsx
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from the URL fragment
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth callback error:", error);
          setError(error.message);
          return;
        }

        if (data.session) {
          // Successfully authenticated, redirect to home
          navigate({ to: "/" });
        } else {
          // Check if there's a session in the URL fragment
          const hashParams = new URLSearchParams(
            window.location.hash.substring(1),
          );
          const accessToken = hashParams.get("access_token");
          const refreshToken = hashParams.get("refresh_token");

          if (accessToken && refreshToken) {
            // Set the session from URL params
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (sessionError) {
              console.error("Session error:", sessionError);
              setError(sessionError.message);
              return;
            }

            // Session set successfully, redirect to home
            navigate({ to: "/" });
          } else {
            // No session found, redirect back to login
            setError("Authentication failed. Please try again.");
            setTimeout(() => {
              navigate({ to: "/" });
            }, 2000);
          }
        }
      } catch (err) {
        console.error("Unexpected error during auth callback:", err);
        setError("An unexpected error occurred. Please try again.");
        setTimeout(() => {
          navigate({ to: "/" });
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "2rem",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "4px solid #f3f4f6",
            borderTop: "4px solid #3b82f6",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            marginBottom: "1rem",
          }}
        />
        <p style={{ color: "#6b7280", fontSize: "1.125rem" }}>
          Completing authentication...
        </p>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "2rem",
        }}
      >
        <div
          style={{
            maxWidth: "400px",
            padding: "2rem",
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              color: "#dc2626",
              marginBottom: "1rem",
              fontSize: "1.25rem",
            }}
          >
            Authentication Error
          </h2>
          <p style={{ color: "#7f1d1d", marginBottom: "1.5rem" }}>{error}</p>
          <button
            onClick={() => navigate({ to: "/login" })}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return null;
}

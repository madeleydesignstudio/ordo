// src/routes/login.tsx
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "../contexts/AuthContext";
import { LoginForm } from "../components/LoginForm";
import { useEffect } from "react";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already authenticated, redirect to home
    if (!loading && user) {
      navigate({ to: "/" });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "1.125rem",
          color: "#6b7280",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f9fafb",
      }}
    >
      <LoginForm />
    </div>
  );
}

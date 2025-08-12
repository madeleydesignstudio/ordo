// src/routes/signup.tsx
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";
import { SignUpForm } from "../components/SignUpForm";

export const Route = createFileRoute("/signup")({
  component: SignUp,
});

function SignUp() {
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
      <SignUpForm />
    </div>
  );
}

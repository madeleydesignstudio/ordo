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
      <div className="flex justify-center items-center h-screen text-lg text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <SignUpForm />
    </div>
  );
}

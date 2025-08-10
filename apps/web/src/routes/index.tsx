// src/routes/index.tsx
import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { Navigation } from "../components/Navigation";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <ProtectedRoute>
      <Navigation />
      <main
        style={{
          padding: "2rem",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            fontSize: "2rem",
            marginBottom: "1rem",
            color: "#1f2937",
          }}
        >
          Welcome to Ordo
        </h1>
        <p
          style={{
            fontSize: "1.125rem",
            color: "#6b7280",
            marginBottom: "2rem",
          }}
        >
          Your personal task management application.
        </p>
        <div
          style={{
            padding: "2rem",
            backgroundColor: "white",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
          }}
        >
          <h2 style={{ marginBottom: "1rem", color: "#374151" }}>Dashboard</h2>
          <p style={{ color: "#6b7280" }}>
            You are now successfully authenticated! Start building your task
            management features here.
          </p>
        </div>
      </main>
    </ProtectedRoute>
  );
}

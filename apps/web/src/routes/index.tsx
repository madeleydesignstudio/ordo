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
      <main className="p-8 max-w-6xl mx-auto">
        <h1 className="text-3xl mb-4 text-gray-800">Welcome to Ordo</h1>
        <p className="text-lg text-gray-500 mb-8">
          Your personal task management application.
        </p>
        <div className="p-8 bg-white rounded-lg border border-gray-200">
          <h2 className="mb-4 text-gray-700">Dashboard</h2>
          <p className="text-gray-500">
            You are now successfully authenticated! Start building your task
            management features here.
          </p>
        </div>
      </main>
    </ProtectedRoute>
  );
}

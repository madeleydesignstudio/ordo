// src/routes/index.tsx
import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "../hooks/useAuth";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to Ordo!
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          You are successfully authenticated and can access the protected
          content.
        </p>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            User Information:
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            <strong>Email:</strong> {user?.email}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            <strong>ID:</strong> {user?.id}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            <strong>Last Sign In:</strong>{" "}
            {user?.last_sign_in_at
              ? new Date(user.last_sign_in_at).toLocaleString()
              : "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
}

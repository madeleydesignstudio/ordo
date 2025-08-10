// src/routes/auth.callback.tsx
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
});

function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle the auth callback
        const { data, error: authError } = await supabase.auth.getSession();

        if (authError) {
          console.error("Auth callback error:", authError.message);
          setError(`Authentication failed: ${authError.message}`);

          // Wait a moment to show the error, then redirect
          setTimeout(() => {
            router.navigate({ to: "/" });
          }, 3000);
          return;
        }

        if (data.session) {
          // Successfully authenticated, redirect to home
          console.log("Authentication successful");
          router.navigate({ to: "/" });
        } else {
          // No session found, might be an email confirmation
          console.log("No session found, redirecting to login");
          router.navigate({ to: "/" });
        }
      } catch (error) {
        console.error("Unexpected error during auth callback:", error);
        setError("An unexpected error occurred during sign in.");

        setTimeout(() => {
          router.navigate({ to: "/" });
        }, 3000);
      }
    };

    // Small delay to ensure URL parameters are processed
    const timer = setTimeout(handleAuthCallback, 100);
    return () => clearTimeout(timer);
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-medium">Authentication Error</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Redirecting to login page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">
          Completing sign in...
        </p>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
          Please wait while we verify your authentication
        </p>
      </div>
    </div>
  );
}

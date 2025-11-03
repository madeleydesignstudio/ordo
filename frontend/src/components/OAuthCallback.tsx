import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";

const OAuthCallback: React.FC = () => {
  const { handleCallback } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");
      const errorParam = urlParams.get("error");

      if (errorParam) {
        setError(`OAuth error: ${errorParam}`);
        return;
      }

      if (!token) {
        setError("No authentication token received");
        return;
      }

      try {
        await handleCallback();
        // Clean up URL and let AuthContext handle the rest
        window.history.replaceState({}, document.title, "/");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Authentication failed");
      }
    };

    processCallback();
  }, [handleCallback]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">
            Authentication failed
          </h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <div className="mt-6">
            <button
              onClick={() => (window.location.href = "/")}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Return to sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show processing state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <h2 className="mt-4 text-xl font-semibold text-gray-900">
          Completing sign in...
        </h2>
        <p className="mt-2 text-gray-600">
          Please wait while we process your authentication
        </p>
      </div>
    </div>
  );
};

export default OAuthCallback;

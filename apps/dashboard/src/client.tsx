/// <reference types="vinxi/types/client" />
import { StartClient } from "@tanstack/react-start";
import { StrictMode, Suspense } from "react";
import { hydrateRoot } from "react-dom/client";
import { createRouter } from "./router.js";
import { PostHogProvider } from "posthog-js/react";
import type { PostHog } from 'posthog-js';
// @ts-expect-error - Module resolution issue with react-error-boundary
import { ErrorBoundary } from "react-error-boundary";

// Create a loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
  </div>
);

// Create an error fallback component
const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
    <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
    <p className="text-gray-600 dark:text-gray-400 mb-4">{error.message}</p>
    <button
      onClick={resetErrorBoundary}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
    >
      Try again
    </button>
  </div>
);

const router = createRouter();

// Initialize PostHog with better error handling
const initPostHog = () => {
  try {
    return {
      apiKey: import.meta.env.PUBLIC_POSTHOG_KEY,
      options: {
        api_host: import.meta.env.PUBLIC_POSTHOG_HOST,
        debug: import.meta.env.MODE === "development",
        loaded: (posthog: PostHog) => {
          if (import.meta.env.MODE === "development") {
            posthog.debug();
          }
        },
        capture_pageview: true,
        persistence: 'localStorage' as const,
        disable_session_recording: import.meta.env.MODE === "development",
      },
    };
  } catch (error) {
    console.error('Failed to initialize PostHog:', error);
    return null;
  }
};

const postHogConfig = initPostHog();

hydrateRoot(
  document,
  <StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={<LoadingFallback />}>
        {postHogConfig ? (
          <PostHogProvider {...postHogConfig}>
            <StartClient router={router} />
          </PostHogProvider>
        ) : (
          <StartClient router={router} />
        )}
      </Suspense>
    </ErrorBoundary>
  </StrictMode>,
);

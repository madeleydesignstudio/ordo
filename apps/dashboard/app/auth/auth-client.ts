import { createAuthClient } from "better-auth/react";

// Determine environment and set appropriate engine URL
// Check for development environment in both server and client contexts
const isDevelopment = 
  (typeof window !== 'undefined' && window.location.hostname === 'localhost') ||
  (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') ||
  (typeof import.meta.env !== 'undefined' && import.meta.env.DEV);

const baseURL = isDevelopment 
  ? 'http://localhost:4321'  // Always use localhost in development
  : import.meta.env.VITE_ENGINE_PROD_URL;

console.log('Auth client environment:', { isDevelopment, baseURL });

const authClient = createAuthClient({
  baseURL,
  fetchOptions: {
    credentials: "include",
  },
}) as ReturnType<typeof createAuthClient>;

export default authClient;

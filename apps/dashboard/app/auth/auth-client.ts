import { createAuthClient } from "better-auth/react";

// Determine environment and set appropriate engine URL
const isDevelopment = typeof window !== 'undefined' && window.location.hostname === 'localhost';
const baseURL = isDevelopment 
  ? "http://localhost:4321"  // Local development engine
  : "https://engine.dev-0af.workers.dev"; // Production engine

console.log('Auth client environment:', { isDevelopment, baseURL });

const authClient = createAuthClient({
  baseURL,
  fetchOptions: {
    credentials: "include",
  },
});

export default authClient;

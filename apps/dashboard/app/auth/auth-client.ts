import { createAuthClient } from "better-auth/react";

// Point directly to the engine where Better Auth server is running
const isDevelopment = 
  (typeof window !== 'undefined' && window.location.hostname === 'localhost') ||
  (typeof process !== 'undefined' && process.env.NODE_ENV === 'development');

const baseURL = isDevelopment 
  ? 'http://localhost:4321'  // Engine dev URL
  : 'https://engine.dev-0af.workers.dev'; // Engine prod URL

console.log('Auth client pointing to engine:', baseURL);

const authClient = createAuthClient({
  baseURL,
  fetchOptions: {
    credentials: "include",
  },
});

export default authClient;

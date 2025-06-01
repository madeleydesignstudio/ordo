import { createAuthClient } from "better-auth/react";

// Determine environment and set appropriate engine URL
const isDevelopment = typeof window !== 'undefined' && window.location.hostname === 'localhost';
const baseURL = isDevelopment 
  ? import.meta.env.VITE_ENGINE_DEV_URL
  : import.meta.env.VITE_ENGINE_PROD_URL ;

console.log('Auth client environment:', { isDevelopment, baseURL });

const authClient = createAuthClient({
  baseURL,
  fetchOptions: {
    credentials: "include",
  },
}) as ReturnType<typeof createAuthClient>;

export default authClient;

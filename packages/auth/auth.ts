import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { reactStartCookies } from "better-auth/react-start";
import type { createDb } from "@ordo/neon-db/db";

export function createAuth(db: ReturnType<typeof createDb>, env: any) {
  // Use the correct base URL based on environment
  const isDevelopment = env.ENVIRONMENT === 'development';
  const baseURL = isDevelopment ? env.DEV_BASE_URL : env.PROD_BASE_URL;
  
  console.log('Better Auth config:', {
    environment: env.ENVIRONMENT,
    isDevelopment,
    baseURL,
    devUrl: env.DEV_BASE_URL,
    prodUrl: env.PROD_BASE_URL
  });
  
  // Set trusted origins based on environment - include both engine and dashboard URLs
  const trustedOrigins = [
    "http://localhost:3001", // Development dashboard
    "http://localhost:4321", // Development engine
    "https://dashboard.dev-0af.workers.dev", // Production dashboard
    "https://engine.dev-0af.workers.dev",  // Production engine
  ];

  return betterAuth({
    baseURL,
    database: drizzleAdapter(db, {
      provider: "pg",
    }),

    trustedOrigins,

    plugins: [reactStartCookies()],

    session: {
      cookieCache: {
        enabled: true,
        maxAge: 10080 * 60, // 10080 minutes
      },
    },

    // https://www.better-auth.com/docs/concepts/oauth
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID!,
        clientSecret: env.GOOGLE_CLIENT_SECRET!,
      },
    },

    user: {
      deleteUser: {
        enabled: true,
      },
    },
  });
}

export type AuthType = {
    user: any | null
    session: any | null
}







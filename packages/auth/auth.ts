import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { reactStartCookies } from "better-auth/react-start";
import type { createDb } from "@ordo/neon-db/db";

export function createAuth(db: ReturnType<typeof createDb>, env: any) {
  // Use explicit environment variable to determine environment
  const isDev = env.ENVIRONMENT === 'development';
  
  // Use production URL for deployed workers, dev URL for local development
  const baseURL = isDev ? env.DEV_BASE_URL : env.PROD_BASE_URL;
  
  // Set trusted origins based on environment
  const trustedOrigins = isDev 
    ? ["http://localhost:3001"] // Development dashboard
    : ["https://dashboard.dev-0af.workers.dev"]; // Production dashboard - Change this to wrangler
  
  console.log('Auth config:', { isDev, baseURL, trustedOrigins });

  return betterAuth({
    baseURL,
    database: drizzleAdapter(db, {
      provider: "pg",
    }),

    // Allow requests from dashboard
    trustedOrigins,
    
    // Add advanced CORS configuration
    advanced: {
      crossSubDomainCookies: {
        enabled: true,
      },
      defaultCookieAttributes: {
        sameSite: isDev ? "lax" : "none", // Use "none" for production cross-origin
        secure: !isDev, // Use secure cookies in production
      },
    },

    // https://www.better-auth.com/docs/integrations/tanstack#usage-tips
    plugins: [reactStartCookies()],

    // https://www.better-auth.com/docs/concepts/session-management#session-caching
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

    // https://www.better-auth.com/docs/concepts/users-accounts#delete-user
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
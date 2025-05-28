import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { reactStartCookies } from "better-auth/react-start";
import type { createDb } from "@ordo/neon-db/db";

export function createAuth(db: ReturnType<typeof createDb>, env: any) {
  return betterAuth({
    baseURL: env.BASE_URL,
    database: drizzleAdapter(db, {
      provider: "pg",
    }),

    // Allow requests from dashboard
    trustedOrigins: ["http://localhost:3001"],
    

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
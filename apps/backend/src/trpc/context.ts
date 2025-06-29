import type { Context } from 'hono'
import { getAuth } from '@hono/clerk-auth'
import { createClerkClient } from '@clerk/backend'
import { createDatabase } from '@ordo/database'

export const createTRPCContext = (opts: any, c: Context) => {
  const auth = getAuth(c)
  
  // Factory function to create Clerk client when needed
  const createClerkClientInstance = () => {
    return createClerkClient({
      secretKey: c.env.CLERK_SECRET_KEY,
    })
  }

  // Create database instance with Workers environment variable
  const db = createDatabase(c.env.DATABASE_URL)
  
  return {
    auth,
    userId: auth?.userId || null,
    sessionId: auth?.sessionId || null,
    env: c.env,
    db,
    clerkClient: createClerkClientInstance,
  }
}

export type TRPCContext = ReturnType<typeof createTRPCContext> 
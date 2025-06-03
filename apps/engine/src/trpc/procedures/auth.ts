import { createAuth } from '@ordo/auth'
import { createDb } from '@ordo/neon-db/db'
import { publicProcedure, router, type SessionData, type SignOutResponse } from '@ordo/trpc'

export const authRouter = router({
  // Get current session/user
  getSession: publicProcedure
    .query(async ({ ctx }): Promise<SessionData> => {
      try {
        if (!ctx.env) {
          return { data: { user: null, session: null }, error: 'No environment context' }
        }

        const db = createDb(ctx.env.DATABASE_URL)
        const auth = createAuth(db, ctx.env)

        const session = await auth.api.getSession({
          headers: ctx.req?.headers || new Headers(),
        })

        return {
          data: {
            user: session?.user || null,
            session: session?.session || null,
          },
          error: null,
        }
      } catch (error) {
        console.error('Session fetch error:', error)
        return {
          data: { user: null, session: null },
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    }),

  // Sign out
  signOut: publicProcedure
    .mutation(async ({ ctx }): Promise<SignOutResponse> => {
      try {
        if (!ctx.env) {
          throw new Error('No environment context')
        }

        const db = createDb(ctx.env.DATABASE_URL)
        const auth = createAuth(db, ctx.env)

        await auth.api.signOut({
          headers: ctx.req?.headers || new Headers(),
        })

        return { success: true }
      } catch (error) {
        console.error('Sign out error:', error)
        throw new Error(error instanceof Error ? error.message : 'Sign out failed')
      }
    }),
}) 
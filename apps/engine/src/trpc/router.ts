import { HelloSchema, publicProcedure, router } from '@ordo/trpc'
import { authRouter } from './procedures/auth'
import { healthProcedure } from './procedures/health'
import { postsRouter } from './procedures/posts'

export const appRouter = router({
  // Health check
  health: healthProcedure,

  // Hello procedure with input
  hello: publicProcedure
    .input(HelloSchema)
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.name ?? 'World'}!`,
        timestamp: new Date().toISOString(),
      }
    }),

  // Auth procedures
  auth: authRouter,

  // Posts procedures
  posts: postsRouter,
})

export type AppRouter = typeof appRouter 
import { initTRPC, TRPCError } from '@trpc/server'
import type { TRPCContext } from './context'

const t = initTRPC.context<TRPCContext>().create()

export const router = t.router
export const publicProcedure = t.procedure

// Protected procedure that requires authentication
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    })
  }
  
  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
    },
  })
}) 
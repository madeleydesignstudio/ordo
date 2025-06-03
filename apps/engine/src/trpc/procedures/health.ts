import { publicProcedure } from '@ordo/trpc'

export const healthProcedure = publicProcedure
  .query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  }) 
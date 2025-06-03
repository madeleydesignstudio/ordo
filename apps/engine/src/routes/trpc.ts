import { trpcServer } from '@hono/trpc-server'
import { Hono } from 'hono'
import type { AppEnv } from '../lib/types'
import { appRouter } from '../trpc/router'
import { createTRPCContext } from '../trpc/context'

const trpcApp = new Hono<AppEnv>()

trpcApp.use(
  '/trpc/*',
  trpcServer({
    router: appRouter,
    createContext: (_opts, c) => createTRPCContext(c),
  })
)

export default trpcApp 
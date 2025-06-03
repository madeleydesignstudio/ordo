import type { Context } from 'hono'
import type { AppEnv } from '../lib/types'

export function createTRPCContext(c: Context<AppEnv>) {
  return {
    req: c.req.raw,
    env: c.env,
  }
}

export type TRPCContext = ReturnType<typeof createTRPCContext> 
import { Hono } from 'hono'
import { createAuth } from '@ordo/auth'
import { createDb } from '@ordo/neon-db/db'
import type { AuthType } from '@ordo/auth'

const router = new Hono<{ Bindings: { DATABASE_URL: string }, Variables: AuthType }>({
  strict: false,
})

router.on(['POST', 'GET'], '/auth/*', (c) => {
  const db = createDb(c.env.DATABASE_URL)
  const auth = createAuth(db, c.env)
  return auth.handler(c.req.raw)
})

export default router
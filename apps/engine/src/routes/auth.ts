import { Hono } from 'hono'
import { createAuth } from '@ordo/auth'
import { createDb } from '@ordo/neon-db/db'
import type { AppEnv } from '../lib/types'

const authApp = new Hono<AppEnv>()

authApp.all('/api/auth/*', async (c) => {
  const db = createDb(c.env.DATABASE_URL)
  const auth = createAuth(db, c.env)
  
  return auth.handler(c.req.raw)
})

export default authApp 
import { Hono } from 'hono'
import type { AppEnv } from '../lib/types'

const healthApp = new Hono<AppEnv>()

healthApp.get('/', (c) => {
  return c.text('Hello World! Engine is running.')
})

export default healthApp 
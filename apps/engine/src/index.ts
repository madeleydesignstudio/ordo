import { Hono } from 'hono'
import type { AppEnv } from './lib/types'
import { corsMiddleware } from './middleware/cors'
import authApp from './routes/auth'
import healthApp from './routes/health'
import trpcApp from './routes/trpc'
import uploadImageApp from './routes/upload-image'

const app = new Hono<AppEnv>()

// Apply CORS middleware globally
app.use('*', corsMiddleware)

// Mount routes
const routes = app
  .route('/', healthApp)
  .route('/', trpcApp)
  .route('/', authApp)
  .route('/', uploadImageApp)

export default app
export type AppType = typeof routes

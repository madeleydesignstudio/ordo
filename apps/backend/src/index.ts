import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { clerkMiddleware } from '@hono/clerk-auth'
import { trpcServer } from '@hono/trpc-server'
import { appRouter } from './trpc/router'
import { createTRPCContext } from './trpc/context'

type CloudflareBindings = {
  CLERK_PUBLISHABLE_KEY: string
  CLERK_SECRET_KEY: string
}

const app = new Hono<{
  Bindings: CloudflareBindings
  Variables: {
    clerkAuth: any
  }
}>()

// CORS middleware
app.use('*', cors({
  origin: (origin) => {
    // Allow any origin in development
    return origin || '*'
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH'],
  allowHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
    'ngrok-skip-browser-warning'
  ],
  exposeHeaders: ['Content-Length', 'X-Request-Id'],
  credentials: true,
  maxAge: 86400, // 24 hours
}))

// Clerk middleware - automatically uses CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY env vars
app.use('*', clerkMiddleware())

// tRPC server
app.use(
  '/trpc/*',
  trpcServer({
    router: appRouter,
    createContext: (opts, c) => createTRPCContext(opts, c),
  })
)

// Health check endpoint
app.get('/', (c) => {
  return c.json({ message: 'Ordo Backend API', status: 'healthy' })
})

// Error handling middleware - should come after routes
app.onError((err, c) => {
  console.error('Server error:', err)
  
  // Handle Clerk-specific errors
  if (err.message.includes('Unauthorized') || err.message.includes('Invalid token')) {
    return c.json({ error: 'Authentication failed' }, 401)
  }
  
  // Handle other errors
  return c.json({ error: 'Internal server error' }, 500)
})

export default app

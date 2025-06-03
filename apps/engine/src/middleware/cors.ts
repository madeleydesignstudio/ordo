import { cors } from 'hono/cors'
import type { MiddlewareHandler } from 'hono'

export const corsMiddleware: MiddlewareHandler = cors({
  origin: (origin, c) => {
    const allowedOrigins = [
      'http://localhost:3001', // Development dashboard
      'https://dashboard.dev-0af.workers.dev' // Production dashboard
    ]
    return allowedOrigins.includes(origin) ? origin : null
  },
  credentials: true,
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}) 
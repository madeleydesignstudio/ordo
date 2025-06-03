import { initTRPC } from '@trpc/server'
import { z } from 'zod'

// Create tRPC context with request and environment
export const createContext = (req?: Request, env?: any) => {
  return {
    req,
    env
  }
}

type Context = Awaited<ReturnType<typeof createContext>>

// Initialize tRPC
const t = initTRPC.context<Context>().create()

// Create router and procedure helpers
export const router = t.router
export const publicProcedure = t.procedure

// Shared Zod schemas
export const CreatePostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
})

export const HelloSchema = z.object({
  name: z.string().optional(),
})

// Auth response types
export type SessionData = {
  data: {
    user: any | null
    session: any | null
  }
  error: string | null
}

export type SignOutResponse = {
  success: boolean
}

// Re-export the AppRouter type from the engine
export type { AppRouter } from '../../../apps/engine/src/trpc/router' 
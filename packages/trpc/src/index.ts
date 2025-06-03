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

// Project schemas
export const CreateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  icon: z.string().optional(),
  cover: z.string().optional(),
  startDate: z.string().optional(), // ISO date string
  dueDate: z.string().optional(), // ISO date string
  status: z.enum(['backlog', 'todo', 'in_progress', 'done', 'on_hold']).default('backlog'),
  parentProjectId: z.string().uuid().optional(),
})

export const UpdateProjectSchema = CreateProjectSchema.partial().extend({
  id: z.string().uuid(),
})

// Task schemas
export const CreateTaskSchema = z.object({
  name: z.string().min(1, 'Task name is required'),
  description: z.string().optional(),
  startDate: z.string().optional(), // ISO date string
  dueDate: z.string().optional(), // ISO date string
  status: z.enum(['backlog', 'todo', 'in_progress', 'done', 'on_hold']).default('backlog'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  labels: z.array(z.string()).default([]),
  projectId: z.string().uuid().optional(), // Can be null (tasks without projects)
  parentTaskId: z.string().uuid().optional(),
})

export const UpdateTaskSchema = CreateTaskSchema.partial().extend({
  id: z.string().uuid(),
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
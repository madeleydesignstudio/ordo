import { HelloSchema, publicProcedure, router } from '@ordo/trpc'
import { healthProcedure } from './procedures/health'
import { projectsRouter } from './procedures/projects'
import { tasksRouter } from './procedures/tasks'
import { notesRouter } from './procedures/notes'

export const appRouter = router({
  // Health check
  health: healthProcedure,

  // Hello procedure with input
  hello: publicProcedure
    .input(HelloSchema)
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.name ?? 'World'}!`,
        timestamp: new Date().toISOString(),
      }
    }),

  // Projects procedures
  projects: projectsRouter,

  // Tasks procedures
  tasks: tasksRouter,

  // Notes procedures
  notes: notesRouter,
})

export type AppRouter = typeof appRouter 
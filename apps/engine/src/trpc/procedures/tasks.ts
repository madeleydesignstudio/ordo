import { createAuth } from '@ordo/auth'
import { createDb } from '@ordo/neon-db/db'
import { task } from '@ordo/neon-db/schema'
import { CreateTaskSchema, UpdateTaskSchema, publicProcedure, router } from '@ordo/trpc'
import { TRPCError } from '@trpc/server'
import { eq, and, desc } from 'drizzle-orm'
import { z } from 'zod'

export const tasksRouter = router({
  // Create a new task
  create: publicProcedure
    .input(CreateTaskSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.env) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'No environment context' })
        }

        const db = createDb(ctx.env.DATABASE_URL)
        const auth = createAuth(db, ctx.env)

        // Get current user session
        const session = await auth.api.getSession({
          headers: ctx.req?.headers || new Headers(),
        })

        if (!session?.user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Authentication required' })
        }

        // Create task
        const [newTask] = await db
          .insert(task)
          .values({
            ...input,
            userId: session.user.id,
            startDate: input.startDate ? new Date(input.startDate) : null,
            dueDate: input.dueDate ? new Date(input.dueDate) : null,
          })
          .returning()

        return newTask
      } catch (error) {
        console.error('Task creation error:', error)
        if (error instanceof TRPCError) throw error
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create task' })
      }
    }),

  // List all tasks for the authenticated user
  list: publicProcedure
    .input(z.object({ projectId: z.string().uuid().optional() }).optional())
    .query(async ({ input, ctx }) => {
      try {
        if (!ctx.env) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'No environment context' })
        }

        const db = createDb(ctx.env.DATABASE_URL)
        const auth = createAuth(db, ctx.env)

        // Get current user session
        const session = await auth.api.getSession({
          headers: ctx.req?.headers || new Headers(),
        })

        if (!session?.user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Authentication required' })
        }

        // Build query conditions
        const conditions = [eq(task.userId, session.user.id)]
        if (input?.projectId) {
          conditions.push(eq(task.projectId, input.projectId))
        }

        // Get all tasks for the user (optionally filtered by project)
        const tasks = await db
          .select()
          .from(task)
          .where(and(...conditions))
          .orderBy(desc(task.createdAt))

        return tasks
      } catch (error) {
        console.error('Task list error:', error)
        if (error instanceof TRPCError) throw error
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch tasks' })
      }
    }),

  // Get a specific task by ID
  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      try {
        if (!ctx.env) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'No environment context' })
        }

        const db = createDb(ctx.env.DATABASE_URL)
        const auth = createAuth(db, ctx.env)

        // Get current user session
        const session = await auth.api.getSession({
          headers: ctx.req?.headers || new Headers(),
        })

        if (!session?.user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Authentication required' })
        }

        // Get task by ID and verify ownership
        const [foundTask] = await db
          .select()
          .from(task)
          .where(and(eq(task.id, input.id), eq(task.userId, session.user.id)))

        if (!foundTask) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Task not found' })
        }

        return foundTask
      } catch (error) {
        console.error('Task get error:', error)
        if (error instanceof TRPCError) throw error
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch task' })
      }
    }),

  // Update a task
  update: publicProcedure
    .input(UpdateTaskSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.env) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'No environment context' })
        }

        const db = createDb(ctx.env.DATABASE_URL)
        const auth = createAuth(db, ctx.env)

        // Get current user session
        const session = await auth.api.getSession({
          headers: ctx.req?.headers || new Headers(),
        })

        if (!session?.user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Authentication required' })
        }

        // Prepare update data
        const { id, ...updateData } = input
        const processedData = {
          ...updateData,
          startDate: updateData.startDate ? new Date(updateData.startDate) : undefined,
          dueDate: updateData.dueDate ? new Date(updateData.dueDate) : undefined,
          updatedAt: new Date(),
        }

        // Update task and verify ownership
        const [updatedTask] = await db
          .update(task)
          .set(processedData)
          .where(and(eq(task.id, id), eq(task.userId, session.user.id)))
          .returning()

        if (!updatedTask) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Task not found or unauthorized' })
        }

        return updatedTask
      } catch (error) {
        console.error('Task update error:', error)
        if (error instanceof TRPCError) throw error
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update task' })
      }
    }),

  // Delete a task
  delete: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.env) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'No environment context' })
        }

        const db = createDb(ctx.env.DATABASE_URL)
        const auth = createAuth(db, ctx.env)

        // Get current user session
        const session = await auth.api.getSession({
          headers: ctx.req?.headers || new Headers(),
        })

        if (!session?.user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Authentication required' })
        }

        // Delete task and verify ownership
        const [deletedTask] = await db
          .delete(task)
          .where(and(eq(task.id, input.id), eq(task.userId, session.user.id)))
          .returning()

        if (!deletedTask) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Task not found or unauthorized' })
        }

        return { success: true, id: input.id }
      } catch (error) {
        console.error('Task delete error:', error)
        if (error instanceof TRPCError) throw error
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete task' })
      }
    }),
}) 
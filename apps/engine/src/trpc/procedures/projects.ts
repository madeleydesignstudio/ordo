import { createAuth } from '@ordo/auth'
import { createDb } from '@ordo/neon-db/db'
import { project } from '@ordo/neon-db/schema'
import { CreateProjectSchema, UpdateProjectSchema, publicProcedure, router } from '@ordo/trpc'
import { TRPCError } from '@trpc/server'
import { eq, and, desc } from 'drizzle-orm'
import { z } from 'zod'

export const projectsRouter = router({
  // Create a new project
  create: publicProcedure
    .input(CreateProjectSchema)
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

        // Create project
        const [newProject] = await db
          .insert(project)
          .values({
            ...input,
            userId: session.user.id,
            startDate: input.startDate ? new Date(input.startDate) : null,
            dueDate: input.dueDate ? new Date(input.dueDate) : null,
          })
          .returning()

        return newProject
      } catch (error) {
        console.error('Project creation error:', error)
        if (error instanceof TRPCError) throw error
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create project' })
      }
    }),

  // List all projects for the authenticated user
  list: publicProcedure
    .query(async ({ ctx }) => {
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

        // Get all projects for the user
        const projects = await db
          .select()
          .from(project)
          .where(eq(project.userId, session.user.id))
          .orderBy(desc(project.createdAt))

        return projects
      } catch (error) {
        console.error('Project list error:', error)
        if (error instanceof TRPCError) throw error
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch projects' })
      }
    }),

  // Get a specific project by ID
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

        // Get project by ID and verify ownership
        const [foundProject] = await db
          .select()
          .from(project)
          .where(and(eq(project.id, input.id), eq(project.userId, session.user.id)))

        if (!foundProject) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' })
        }

        return foundProject
      } catch (error) {
        console.error('Project get error:', error)
        if (error instanceof TRPCError) throw error
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch project' })
      }
    }),

  // Update a project
  update: publicProcedure
    .input(UpdateProjectSchema)
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

        // Update project and verify ownership
        const [updatedProject] = await db
          .update(project)
          .set(processedData)
          .where(and(eq(project.id, id), eq(project.userId, session.user.id)))
          .returning()

        if (!updatedProject) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found or unauthorized' })
        }

        return updatedProject
      } catch (error) {
        console.error('Project update error:', error)
        if (error instanceof TRPCError) throw error
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update project' })
      }
    }),

  // Delete a project
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

        // Delete project and verify ownership
        const [deletedProject] = await db
          .delete(project)
          .where(and(eq(project.id, input.id), eq(project.userId, session.user.id)))
          .returning()

        if (!deletedProject) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found or unauthorized' })
        }

        return { success: true, id: input.id }
      } catch (error) {
        console.error('Project delete error:', error)
        if (error instanceof TRPCError) throw error
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete project' })
      }
    }),
}) 
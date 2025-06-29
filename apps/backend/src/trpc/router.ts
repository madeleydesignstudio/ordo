import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from './trpc'
import { tasks, projects, projectTasks, eq, and } from '@ordo/database'

export const appRouter = router({
  // Public routes
  hello: publicProcedure
    .input(z.object({ name: z.string().optional() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.name ?? 'World'}!`,
        timestamp: new Date().toISOString(),
      }
    }),

  // Protected routes (require authentication)
  getUserId: protectedProcedure
    .query(async ({ ctx }) => {
      return {
        userId: ctx.userId,
        message: `Your Clerk user ID is: ${ctx.userId}`
      }
    }),

  getMe: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        // Use Clerk client factory from context
        const clerkClient = ctx.clerkClient()
        
        // Fetch user information from Clerk
        const user = await clerkClient.users.getUser(ctx.userId)
        
        return {
          id: user.id,
          email: user.primaryEmailAddress?.emailAddress || user.emailAddresses[0]?.emailAddress,
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.imageUrl,
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt),
        }
      } catch (error) {
        console.error('Error fetching user from Clerk:', error)
        throw new Error('Failed to fetch user information')
      }
    }),

  updateProfile: protectedProcedure
    .input(z.object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Use Clerk client factory from context
        const clerkClient = ctx.clerkClient()
        
        // Update user information in Clerk
        const updatedUser = await clerkClient.users.updateUser(ctx.userId, {
          firstName: input.firstName,
          lastName: input.lastName,
        })
        
        return {
          id: updatedUser.id,
          email: updatedUser.primaryEmailAddress?.emailAddress || updatedUser.emailAddresses[0]?.emailAddress,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          imageUrl: updatedUser.imageUrl,
          createdAt: new Date(updatedUser.createdAt),
          updatedAt: new Date(updatedUser.updatedAt),
        }
      } catch (error) {
        console.error('Error updating user in Clerk:', error)
        throw new Error('Failed to update user information')
      }
    }),

  // Task operations
  getTasks: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userTasks = await ctx.db
          .select()
          .from(tasks)
          .where(eq(tasks.userId, ctx.userId))
          .orderBy(tasks.createdAt)
        
        return userTasks
      } catch (error) {
        console.error('Error fetching tasks:', error)
        throw new Error('Failed to fetch tasks')
      }
    }),

  createTask: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      priority: z.number().min(0).max(2).default(0),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const [newTask] = await ctx.db
          .insert(tasks)
          .values({
            title: input.title,
            description: input.description,
            priority: input.priority,
            userId: ctx.userId,
          })
          .returning()
        
        return newTask
      } catch (error) {
        console.error('Error creating task:', error)
        throw new Error('Failed to create task')
      }
    }),

  updateTask: protectedProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().optional(),
      description: z.string().optional(),
      completed: z.boolean().optional(),
      priority: z.number().min(0).max(2).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const [updatedTask] = await ctx.db
          .update(tasks)
          .set({
            ...(input.title && { title: input.title }),
            ...(input.description !== undefined && { description: input.description }),
            ...(input.completed !== undefined && { completed: input.completed }),
            ...(input.priority !== undefined && { priority: input.priority }),
            updatedAt: new Date(),
          })
          .where(and(eq(tasks.id, input.id), eq(tasks.userId, ctx.userId)))
          .returning()
        
        if (!updatedTask) {
          throw new Error('Task not found or unauthorized')
        }
        
        return updatedTask
      } catch (error) {
        console.error('Error updating task:', error)
        throw new Error('Failed to update task')
      }
    }),

  deleteTask: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const [deletedTask] = await ctx.db
          .delete(tasks)
          .where(and(eq(tasks.id, input.id), eq(tasks.userId, ctx.userId)))
          .returning()
        
        if (!deletedTask) {
          throw new Error('Task not found or unauthorized')
        }
        
        return { success: true }
      } catch (error) {
        console.error('Error deleting task:', error)
        throw new Error('Failed to delete task')
      }
    }),

  // Project operations
  getProjects: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userProjects = await ctx.db
          .select()
          .from(projects)
          .where(eq(projects.userId, ctx.userId))
          .orderBy(projects.createdAt)
        
        return userProjects
      } catch (error) {
        console.error('Error fetching projects:', error)
        throw new Error('Failed to fetch projects')
      }
    }),

  createProject: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      color: z.string().default('#3b82f6'),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const [newProject] = await ctx.db
          .insert(projects)
          .values({
            name: input.name,
            description: input.description,
            color: input.color,
            userId: ctx.userId,
          })
          .returning()
        
        return newProject
      } catch (error) {
        console.error('Error creating project:', error)
        throw new Error('Failed to create project')
      }
    }),

  // Add task to project
  addTaskToProject: protectedProcedure
    .input(z.object({
      taskId: z.string(),
      projectId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify both task and project belong to the user
        const [task] = await ctx.db
          .select()
          .from(tasks)
          .where(and(eq(tasks.id, input.taskId), eq(tasks.userId, ctx.userId)))
        
        const [project] = await ctx.db
          .select()
          .from(projects)
          .where(and(eq(projects.id, input.projectId), eq(projects.userId, ctx.userId)))
        
        if (!task || !project) {
          throw new Error('Task or project not found or unauthorized')
        }
        
        const [projectTask] = await ctx.db
          .insert(projectTasks)
          .values({
            taskId: input.taskId,
            projectId: input.projectId,
          })
          .returning()
        
        return projectTask
      } catch (error) {
        console.error('Error adding task to project:', error)
        throw new Error('Failed to add task to project')
      }
    }),
})

export type AppRouter = typeof appRouter 
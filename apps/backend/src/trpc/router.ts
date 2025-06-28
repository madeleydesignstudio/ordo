import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from './trpc'

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
})

export type AppRouter = typeof appRouter 
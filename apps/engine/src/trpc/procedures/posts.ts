import { CreatePostSchema, publicProcedure, router } from '@ordo/trpc'

export const postsRouter = router({
  create: publicProcedure
    .input(CreatePostSchema)
    .mutation(async ({ input }) => {
      return {
        id: Math.random().toString(36).substr(2, 9),
        title: input.title,
        content: input.content,
        createdAt: new Date().toISOString(),
      }
    }),

  list: publicProcedure
    .query(async () => {
      return [
        {
          id: '1',
          title: 'First Post',
          content: 'This is the first post',
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Second Post',
          content: 'This is the second post',
          createdAt: new Date().toISOString(),
        },
      ]
    })
}) 
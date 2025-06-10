import { createDb } from '@ordo/neon-db/db'
import { folder, note } from '@ordo/neon-db/schema'
import { publicProcedure, router } from '@ordo/trpc'
import { TRPCError } from '@trpc/server'
import { and, asc, desc, eq, isNull, like, or } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import { z } from 'zod'
import { createAuth } from '@ordo/auth'

// Input schemas
const CreateNoteSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.any().optional(),
  htmlContent: z.string().optional(),
  plainTextContent: z.string().optional(),
  folderId: z.string().uuid().optional(),
})

const UpdateNoteSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(255).optional(),
  content: z.any().optional(),
  htmlContent: z.string().optional(),
  plainTextContent: z.string().optional(),
  folderId: z.string().uuid().optional().nullable(),
  isPinned: z.boolean().optional(),
  isFavorite: z.boolean().optional(),
  isArchived: z.boolean().optional(),
})

const GetNotesSchema = z.object({
  folderId: z.string().uuid().optional().nullable(),
  search: z.string().optional(),
  isArchived: z.boolean().optional().default(false),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
})

const NoteIdSchema = z.object({
  id: z.string().uuid(),
})

const CreateFolderSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  color: z.string().optional(),
  parentFolderId: z.string().uuid().optional(),
})

export const notesRouter = router({
  // Create a new note
  create: publicProcedure
    .input(CreateNoteSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.env) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'No environment context' })
        }

        const db = createDb(ctx.env.DATABASE_URL)
        const auth = createAuth(db, ctx.env)

        // Get user from session
        const session = await auth.api.getSession({
          headers: ctx.req?.headers || new Headers(),
        })

        if (!session?.user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Authentication required' })
        }

        const userId = session.user.id

        const [newNote] = await db.insert(note).values({
          id: randomUUID(),
          title: input.title,
          content: input.content || {},
          htmlContent: input.htmlContent || '',
          plainTextContent: input.plainTextContent || '',
          folderId: input.folderId,
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        }).returning()

        return newNote
      } catch (error) {
        console.error('Note creation error:', error)
        if (error instanceof TRPCError) throw error
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create note' })
      }
    }),

  // Update an existing note (for auto-save)
  update: publicProcedure
    .input(UpdateNoteSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.env) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'No environment context' })
        }

        const db = createDb(ctx.env.DATABASE_URL)
        const auth = createAuth(db, ctx.env)

        // Get user from session
        const session = await auth.api.getSession({
          headers: ctx.req?.headers || new Headers(),
        })

        if (!session?.user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Authentication required' })
        }

        const userId = session.user.id
        const { id, ...updateData } = input
        
        const [updatedNote] = await db
          .update(note)
          .set({
            ...updateData,
            updatedAt: new Date(),
          })
          .where(and(eq(note.id, id), eq(note.userId, userId)))
          .returning()

        if (!updatedNote) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Note not found or unauthorized' })
        }

        return updatedNote
      } catch (error) {
        console.error('Note update error:', error)
        if (error instanceof TRPCError) throw error
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update note' })
      }
    }),

  // Get notes with optional filtering
  list: publicProcedure
    .input(GetNotesSchema)
    .query(async ({ input, ctx }) => {
      try {
        if (!ctx.env) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'No environment context' })
        }

        const db = createDb(ctx.env.DATABASE_URL)
        const auth = createAuth(db, ctx.env)

        // Get user from session
        const session = await auth.api.getSession({
          headers: ctx.req?.headers || new Headers(),
        })

        if (!session?.user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Authentication required' })
        }

        const userId = session.user.id
        
        let query = db
          .select()
          .from(note)
          .where(
            and(
              eq(note.userId, userId),
              eq(note.isArchived, input.isArchived),
              input.folderId === null 
                ? isNull(note.folderId)
                : input.folderId 
                  ? eq(note.folderId, input.folderId)
                  : undefined
            )
          )
          .orderBy(desc(note.isPinned), desc(note.updatedAt))
          .limit(input.limit)
          .offset(input.offset)

        // Add search functionality if provided
        if (input.search) {
          query = db
            .select()
            .from(note)
            .where(
              and(
                eq(note.userId, userId),
                eq(note.isArchived, input.isArchived),
                or(
                  like(note.title, `%${input.search}%`),
                  like(note.plainTextContent, `%${input.search}%`)
                ),
                input.folderId === null 
                  ? isNull(note.folderId)
                  : input.folderId 
                    ? eq(note.folderId, input.folderId)
                    : undefined
              )
            )
            .orderBy(desc(note.isPinned), desc(note.updatedAt))
            .limit(input.limit)
            .offset(input.offset)
        }

        return await query
      } catch (error) {
        console.error('Notes list error:', error)
        if (error instanceof TRPCError) throw error
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch notes' })
      }
    }),

  // Get a single note by ID
  getById: publicProcedure
    .input(NoteIdSchema)
    .query(async ({ input, ctx }) => {
      try {
        if (!ctx.env) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'No environment context' })
        }

        const db = createDb(ctx.env.DATABASE_URL)
        const auth = createAuth(db, ctx.env)

        // Get user from session
        const session = await auth.api.getSession({
          headers: ctx.req?.headers || new Headers(),
        })

        if (!session?.user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Authentication required' })
        }

        const userId = session.user.id
        
        const [foundNote] = await db
          .select()
          .from(note)
          .where(and(eq(note.id, input.id), eq(note.userId, userId)))
          .limit(1)

        if (!foundNote) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Note not found or unauthorized' })
        }

        // Update last viewed timestamp
        await db
          .update(note)
          .set({ lastViewedAt: new Date() })
          .where(eq(note.id, input.id))

        return foundNote
      } catch (error) {
        console.error('Note get error:', error)
        if (error instanceof TRPCError) throw error
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch note' })
      }
    }),

  // Delete a note
  delete: publicProcedure
    .input(NoteIdSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.env) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'No environment context' })
        }

        const db = createDb(ctx.env.DATABASE_URL)
        const auth = createAuth(db, ctx.env)

        // Get user from session
        const session = await auth.api.getSession({
          headers: ctx.req?.headers || new Headers(),
        })

        if (!session?.user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Authentication required' })
        }

        const userId = session.user.id
        
        const [deletedNote] = await db
          .delete(note)
          .where(and(eq(note.id, input.id), eq(note.userId, userId)))
          .returning()

        if (!deletedNote) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Note not found or unauthorized' })
        }

        return { success: true }
      } catch (error) {
        console.error('Note delete error:', error)
        if (error instanceof TRPCError) throw error
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete note' })
      }
    }),

  // Folder management
  folders: router({
    // Create a new folder
    create: publicProcedure
      .input(CreateFolderSchema)
      .mutation(async ({ input, ctx }) => {
        try {
          if (!ctx.env) {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'No environment context' })
          }

          const db = createDb(ctx.env.DATABASE_URL)
          const auth = createAuth(db, ctx.env)

          // Get user from session
          const session = await auth.api.getSession({
            headers: ctx.req?.headers || new Headers(),
          })

          if (!session?.user?.id) {
            throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Authentication required' })
          }

          const userId = session.user.id
          
          const [newFolder] = await db.insert(folder).values({
            id: randomUUID(),
            name: input.name,
            description: input.description,
            color: input.color || '#6366f1',
            parentFolderId: input.parentFolderId,
            userId,
            createdAt: new Date(),
            updatedAt: new Date(),
          }).returning()

          return newFolder
        } catch (error) {
          console.error('Folder creation error:', error)
          if (error instanceof TRPCError) throw error
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create folder' })
        }
      }),

    // Get all folders for a user
    list: publicProcedure
      .input(z.object({}).optional())
      .query(async ({ ctx }) => {
        try {
          if (!ctx.env) {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'No environment context' })
          }

          const db = createDb(ctx.env.DATABASE_URL)
          const auth = createAuth(db, ctx.env)

          // Get user from session
          const session = await auth.api.getSession({
            headers: ctx.req?.headers || new Headers(),
          })

          if (!session?.user?.id) {
            throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Authentication required' })
          }

          const userId = session.user.id
          
          return await db
            .select()
            .from(folder)
            .where(eq(folder.userId, userId))
            .orderBy(asc(folder.name))
        } catch (error) {
          console.error('Folders list error:', error)
          if (error instanceof TRPCError) throw error
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch folders' })
        }
      }),

    // Delete a folder
    delete: publicProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ input, ctx }) => {
        try {
          if (!ctx.env) {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'No environment context' })
          }

          const db = createDb(ctx.env.DATABASE_URL)
          const auth = createAuth(db, ctx.env)

          // Get user from session
          const session = await auth.api.getSession({
            headers: ctx.req?.headers || new Headers(),
          })

          if (!session?.user?.id) {
            throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Authentication required' })
          }

          const userId = session.user.id
          
          // First, move all notes in this folder to no folder
          await db
            .update(note)
            .set({ folderId: null })
            .where(and(eq(note.folderId, input.id), eq(note.userId, userId)))

          // Then delete the folder
          const [deletedFolder] = await db
            .delete(folder)
            .where(and(eq(folder.id, input.id), eq(folder.userId, userId)))
            .returning()

          if (!deletedFolder) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Folder not found or unauthorized' })
          }

          return { success: true }
        } catch (error) {
          console.error('Folder delete error:', error)
          if (error instanceof TRPCError) throw error
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete folder' })
        }
      }),
  }),
})
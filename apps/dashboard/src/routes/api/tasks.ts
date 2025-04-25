import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { z } from 'zod'
import { db } from '~/lib/server/db' // Assuming db client is here
import { task, taskStatusEnum } from '~/lib/server/schema/tasks.schema'
import { eq } from 'drizzle-orm'

// Input validation schemas
const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(taskStatusEnum.enumValues).optional().default('todo'),
  dueDate: z.string().datetime().optional().nullable(),
  projectId: z.string().uuid().optional().nullable(), // ProjectId is optional
})

const updateTaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  status: z.enum(taskStatusEnum.enumValues).optional(),
  dueDate: z.string().datetime().optional().nullable(),
  projectId: z.string().uuid().optional().nullable(),
})

const deleteTaskSchema = z.object({
  id: z.string().uuid(),
})

export const APIRoute = createAPIFileRoute('/api/tasks')({
  // GET: Fetch tasks (add filtering later if needed, e.g., by projectId)
  GET: async () => { // Removed unused destructured param
    try {
      // TODO: Add authentication/authorization checks
      // TODO: Add filtering by projectId or userId
      const tasks = await db.select().from(task)
      return json(tasks)
    } catch (error) {
      console.error('Error fetching tasks:', error)
      return json({ error: 'Failed to fetch tasks' }, { status: 500 })
    }
  },

  // POST: Create a new task
  POST: async ({ request }) => {
    try {
      // TODO: Add authentication/authorization checks
      const body = await request.json()
      const validation = createTaskSchema.safeParse(body)

      if (!validation.success) {
        return json({ error: 'Invalid input', details: validation.error.formErrors }, { status: 400 })
      }

      const [newTask] = await db
        .insert(task)
        .values({
          ...validation.data,
          // Ensure dueDate is Date object or null before insertion
          dueDate: validation.data.dueDate ? new Date(validation.data.dueDate) : null,
        })
        .returning()

      return json(newTask, { status: 201 })
    } catch (error) {
      console.error('Error creating task:', error)
      return json({ error: 'Failed to create task' }, { status: 500 })
    }
  },

  // PUT: Update an existing task
  PUT: async ({ request }) => {
    try {
      // TODO: Add authentication/authorization checks
      const body = await request.json()
      const validation = updateTaskSchema.safeParse(body)

      if (!validation.success) {
        return json({ error: 'Invalid input', details: validation.error.formErrors }, { status: 400 })
      }

      const { id, ...updateData } = validation.data

      // Prepare data for update, handling potential undefined/null dueDate
      const dataToSet: Partial<Omit<typeof task.$inferInsert, 'id' | 'createdAt'>> & { updatedAt: Date } = {
          updatedAt: new Date(),
      };

      if (updateData.title !== undefined) dataToSet.title = updateData.title;
      // Allow setting description to null
      if (updateData.description !== undefined) dataToSet.description = updateData.description;
      if (updateData.status !== undefined) dataToSet.status = updateData.status;
      // Allow setting projectId to null
      if (updateData.projectId !== undefined) dataToSet.projectId = updateData.projectId;
      // Handle dueDate carefully: set to Date object, null, or don't include if undefined
      if (updateData.dueDate !== undefined) {
          dataToSet.dueDate = updateData.dueDate === null ? null : new Date(updateData.dueDate);
      }

      if (Object.keys(dataToSet).length <= 1) { // Only updatedAt means no actual fields provided
         return json({ error: 'No update fields provided' }, { status: 400 });
      }

      const [updatedTask] = await db
        .update(task)
        .set(dataToSet)
        .where(eq(task.id, id))
        .returning()

      if (!updatedTask) {
        return json({ error: 'Task not found' }, { status: 404 })
      }

      return json(updatedTask)
    } catch (error) {
      console.error('Error updating task:', error)
      return json({ error: 'Failed to update task' }, { status: 500 })
    }
  },

  // DELETE: Delete a task
  DELETE: async ({ request }) => {
    try {
      // TODO: Add authentication/authorization checks
      // We'll expect the ID in the request body for simplicity with createAPIFileRoute
      const body = await request.json()
      const validation = deleteTaskSchema.safeParse(body)

      if (!validation.success) {
        return json({ error: 'Invalid input', details: validation.error.formErrors }, { status: 400 })
      }

      const { id } = validation.data

      const [deletedTask] = await db.delete(task).where(eq(task.id, id)).returning()

      if (!deletedTask) {
        return json({ error: 'Task not found' }, { status: 404 })
      }

      return json({ message: 'Task deleted successfully' })
    } catch (error) {
      console.error('Error deleting task:', error)
      return json({ error: 'Failed to delete task' }, { status: 500 })
    }
  },
})

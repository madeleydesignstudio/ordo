import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { z } from 'zod'
import { db } from '~/lib/server/db' // Assuming db client is here
import { task, taskStatusEnum } from '~/lib/server/schema/tasks.schema'
import { and, eq, gte, lte } from 'drizzle-orm'

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
  // GET: Fetch tasks, optionally filtered by date range
  GET: async ({ request }) => {
    try {
      const url = new URL(request.url);
      const startDateParam = url.searchParams.get('startDate');
      const endDateParam = url.searchParams.get('endDate');

      let startDate: Date | undefined;
      let endDate: Date | undefined;

      // Basic validation for date params
      if (startDateParam) {
        startDate = new Date(startDateParam);
        if (isNaN(startDate.getTime())) {
          return json({ error: 'Invalid startDate format' }, { status: 400 });
        }
        // Set start date to the beginning of the day
        startDate.setHours(0, 0, 0, 0);
      }
      if (endDateParam) {
        endDate = new Date(endDateParam);
         if (isNaN(endDate.getTime())) {
          return json({ error: 'Invalid endDate format' }, { status: 400 });
        }
        // Set end date to the end of the day for inclusive filtering
        endDate.setHours(23, 59, 59, 999);
      }

      // Build query conditions
      const conditions = [];
      
      // Handle cases where only one date is provided or both
      if (startDate && endDate) {
         conditions.push(and(gte(task.dueDate, startDate), lte(task.dueDate, endDate)));
      } else if (startDate) {
         conditions.push(gte(task.dueDate, startDate));
      } else if (endDate) {
         conditions.push(lte(task.dueDate, endDate));
      }
      // If no dates provided, conditions array remains empty, fetching all tasks (respecting other filters like userId if uncommented)
      
      // Fetch tasks based on conditions
      const finalConditions = conditions.length > 0 ? and(...conditions) : undefined;
      const tasks = await db.select().from(task).where(finalConditions); 
            
      return json(tasks)
    } catch (error) {
      console.error('Error fetching tasks:', error)
      return json({ error: 'Failed to fetch tasks' }, { status: 500 })
    }
  },

  // POST: Create a new task
  POST: async ({ request }) => {
    try {
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
        .where(eq(task.id, id)) // Note: Consider adding userId check here too for security
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
      const body = await request.json()
      const validation = deleteTaskSchema.safeParse(body)

      if (!validation.success) {
        return json({ error: 'Invalid input: ID is required', details: validation.error.formErrors }, { status: 400 });
      }

      const { id } = validation.data

      const [deletedTask] = await db.delete(task).where(eq(task.id, id)).returning() // Note: Consider adding userId check here too

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

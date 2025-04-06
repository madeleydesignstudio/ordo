import { createServerFn } from "@tanstack/start";
import { db } from "@/db/db";
import { tasks } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

// Define validation schema for task creation
const TaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["todo", "in_progress", "in_review", "done"]).default("todo"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  projectId: z.number().optional(),
  dueDate: z.date().optional(),
});

// Define validation schema for task updates
const TaskUpdateSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().optional(),
  status: z.enum(["todo", "in_progress", "in_review", "done"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  projectId: z.number().optional(),
  dueDate: z.date().optional(),
});

// Server function to get all tasks
export const getTasks = createServerFn({ method: "GET" }).handler(async () => {
  return await db.query.tasks.findMany({
    orderBy: [desc(tasks.createdAt)],
  });
});

// Server function to get tasks for a specific project
export const getProjectTasks = createServerFn({ method: "GET" })
  .validator(z.object({ projectId: z.number() }))
  .handler(async ({ data }) => {
    return await db.query.tasks.findMany({
      where: eq(tasks.projectId, data.projectId),
      orderBy: [desc(tasks.createdAt)],
    });
  });

// Server function to get a single task
export const getTask = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.number() }))
  .handler(async ({ data }) => {
    const result = await db.query.tasks.findFirst({
      where: eq(tasks.id, data.id),
    });

    if (!result) {
      throw new Error("Task not found");
    }

    return result;
  });

// Server function to create a new task
export const createTask = createServerFn({ method: "POST" })
  .validator(TaskSchema)
  .handler(async ({ data }) => {
    return await db.insert(tasks).values(data).returning();
  });

// Server function to update a task
export const updateTask = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.number(),
      data: TaskUpdateSchema,
    })
  )
  .handler(async ({ data }) => {
    const result = await db
      .update(tasks)
      .set({
        ...data.data,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, data.id))
      .returning();

    if (result.length === 0) {
      throw new Error("Task not found");
    }

    return result[0];
  });

// Server function to delete a task
export const deleteTask = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.number() }))
  .handler(async ({ data }) => {
    const result = await db
      .delete(tasks)
      .where(eq(tasks.id, data.id))
      .returning();

    if (result.length === 0) {
      throw new Error("Task not found");
    }

    return { message: "Task deleted successfully" };
  });

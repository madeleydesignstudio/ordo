import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { auth } from "~/lib/server/auth";
import { db } from "~/lib/server/db";
import { task, taskStatusEnum } from "~/lib/server/schema/tasks.schema";

// Input validation schema
const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(taskStatusEnum.enumValues).optional().default("todo"),
  dueDate: z.string().datetime().optional().nullable(),
});

export const APIRoute = createAPIFileRoute("/api/projects/$projectId/tasks")({
  // GET: Fetch tasks for a specific project
  GET: async ({ params, request }) => {
    try {
      const { projectId } = params;
      
      // Use auth.api.getSession with request headers
      const session = await auth.api.getSession({ headers: request.headers });
      if (!session?.user?.id) {
        return json({ error: "Unauthorized" }, { status: 401 });
      }
      const userId = session.user.id;

      // Fetch tasks for this project and user
      const tasks = await db
        .select()
        .from(task)
        .where(
          and(
            eq(task.userId, userId), 
            eq(task.projectId, projectId)
          )
        );

      return json({ tasks });
    } catch (error) {
      console.error("Error fetching project tasks:", error);
      return json({ error: "Failed to fetch tasks for this project" }, { status: 500 });
    }
  },

  // POST: Create a new task for a specific project
  POST: async ({ params, request }) => {
    try {
      const { projectId } = params;

      // Use auth.api.getSession with request headers
      const session = await auth.api.getSession({ headers: request.headers });
      if (!session?.user?.id) {
        return json(
          { error: "Authentication required to create a task." },
          { status: 401 },
        );
      }
      const userId = session.user.id;

      const body = await request.json();
      const validation = createTaskSchema.safeParse(body);

      if (!validation.success) {
        return json(
          { error: "Invalid input", details: validation.error.formErrors },
          { status: 400 },
        );
      }

      // Create the task with the provided project ID from the URL
      const [newTask] = await db
        .insert(task)
        .values({
          ...validation.data,
          projectId,
          userId,
          dueDate: validation.data.dueDate ? new Date(validation.data.dueDate) : null,
        })
        .returning();

      return json({ task: newTask }, { status: 201 });
    } catch (error) {
      console.error("Error creating task:", error);
      return json({ error: "Failed to create task" }, { status: 500 });
    }
  },
}); 
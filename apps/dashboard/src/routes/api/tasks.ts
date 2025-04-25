import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { db } from "../../lib/server/db";
import { task, taskStatusEnum } from "../../lib/server/schema";
import { desc, eq } from "drizzle-orm";
// TODO: Import authentication mechanism

// Type alias for cleaner code
type TaskStatus = typeof taskStatusEnum.enumValues[number];

// Helper to validate status
const validateStatus = (status: unknown): TaskStatus | undefined => {
  if (typeof status === 'string' && (taskStatusEnum.enumValues as ReadonlyArray<string>).includes(status)) {
    return status as TaskStatus;
  }
  return undefined;
};

export const APIRoute = createAPIFileRoute("/api/tasks")({
  GET: async ({ request }) => {
    // TODO: Implement user authentication check here
    // const userId = await getUserIdFromSession(request);
    // if (!userId) return json({ error: "Unauthorized" }, { status: 401 });

    try {
      const { searchParams } = new URL(request.url);
      const projectId = searchParams.get("projectId");

      if (!projectId) {
         return json({ error: "projectId query parameter is required"}, { status: 400 });
      }

      // TODO: Verify that the project belongs to the authenticated user
      // const project = await db.query.project.findFirst({
      //   where: and(eq(project.id, projectId), eq(project.userId, userId))
      // });
      // if (!project) return json({ error: "Project not found or access denied" }, { status: 404 });

      // Fetch tasks for the given project ID
      const tasksForProject = await db.query.task.findMany({
         where: eq(task.projectId, projectId),
         orderBy: [desc(task.createdAt)],
       });

      return json({ tasks: tasksForProject });
    } catch (error) {
      console.error("Error fetching tasks:", error);
      // Add more specific error handling if needed (e.g., invalid UUID format)
      return json({ error: "Failed to fetch tasks" }, { status: 500 });
    }
  },

  POST: async ({ request }) => {
    // TODO: Implement user authentication check here
    // const userId = await getUserIdFromSession(request);
    // if (!userId) return json({ error: "Unauthorized" }, { status: 401 });

    try {
      const body = await request.json();
      const { title, description, status: rawStatus = 'todo', projectId, dueDate } = body;

      // Validate required fields
      if (!title) {
        return json({ error: "Title is required" }, { status: 400 });
      }
      if (!projectId) {
        return json({ error: "Project ID (UUID) is required" }, { status: 400 });
      }
      // Validate status enum
      const status = validateStatus(rawStatus);
      if (!status) {
        return json({ error: `Invalid status: ${rawStatus}. Must be one of: ${taskStatusEnum.enumValues.join(', ')}` }, { status: 400 });
      }

      // TODO: Verify that the project belongs to the authenticated user before inserting task
      // const project = await db.query.project.findFirst({
      //   where: and(eq(project.id, projectId), eq(project.userId, userId))
      // });
      // if (!project) return json({ error: "Project not found or access denied" }, { status: 404 });

      // Create new task
      const [newTask] = await db
        .insert(task)
        .values({
          title: title,
          description: description || null,
          status: status,
          projectId: projectId,
          dueDate: dueDate ? new Date(dueDate) : null,
        })
        .returning();

      return json({ task: newTask }, { status: 201 });
    } catch (error) {
      console.error("Error creating task:", error);
      // Add more specific error handling (e.g., foreign key constraint)
      return json({ error: "Failed to create task" }, { status: 500 });
    }
  },
});

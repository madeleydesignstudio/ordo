import { json } from "@tanstack/start";
import { createAPIFileRoute } from "@tanstack/start/api";
import { db } from "../../lib/server/db";
import { tasks } from "../../lib/server/schema";
import { desc } from "drizzle-orm";

export const APIRoute = createAPIFileRoute("/api/tasks")({
  GET: async ({ request }) => {
    try {
      const { searchParams } = new URL(request.url);
      const projectId = searchParams.get("projectId");

      let query = db.query.tasks.findMany({
        orderBy: [desc(tasks.createdAt)],
      });

      // If projectId is provided, filter tasks by project
      if (projectId) {
        query = db.query.tasks.findMany({
          where: (tasks, { eq }) =>
            eq(tasks.projectId, parseInt(projectId, 10)),
          orderBy: [desc(tasks.createdAt)],
        });
      }

      const allTasks = await query;
      return json({ tasks: allTasks });
    } catch (error) {
      console.error("Error fetching tasks:", error);
      return json({ error: "Failed to fetch tasks" }, { status: 500 });
    }
  },

  POST: async ({ request }) => {
    try {
      const body = await request.json();

      // Validate required fields
      if (!body.title) {
        return json({ error: "Title is required" }, { status: 400 });
      }

      if (!body.projectId) {
        return json({ error: "Project ID is required" }, { status: 400 });
      }

      // Create new task
      const newTask = await db
        .insert(tasks)
        .values({
          title: body.title,
          description: body.description || null,
          status: body.status || "todo",
          priority: body.priority || "medium",
          projectId: parseInt(body.projectId, 10),
          dueDate: body.dueDate ? new Date(body.dueDate) : null,
        })
        .returning();

      return json({ task: newTask[0] }, { status: 201 });
    } catch (error) {
      console.error("Error creating task:", error);
      return json({ error: "Failed to create task" }, { status: 500 });
    }
  },
});

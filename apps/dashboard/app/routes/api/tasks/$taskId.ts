import { json } from "@tanstack/start";
import { createAPIFileRoute } from "@tanstack/start/api";
import { db } from "../../../db/db";
import { tasks } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const APIRoute = createAPIFileRoute("/api/tasks/$taskId")({
  GET: async ({ request, params }) => {
    try {
      const { taskId } = params;

      // Ensure taskId is a valid number
      const taskIdNum = parseInt(taskId, 10);
      if (isNaN(taskIdNum)) {
        return json({ error: "Invalid task ID" }, { status: 400 });
      }

      const task = await db.query.tasks.findFirst({
        where: eq(tasks.id, taskIdNum),
      });

      if (!task) {
        return json({ error: "Task not found" }, { status: 404 });
      }

      return json(task);
    } catch (error) {
      console.error("Error fetching task:", error);
      return json({ error: "Failed to fetch task" }, { status: 500 });
    }
  },

  PUT: async ({ request, params }) => {
    try {
      const { taskId } = params;

      // Ensure taskId is a valid number
      const taskIdNum = parseInt(taskId, 10);
      if (isNaN(taskIdNum)) {
        return json({ error: "Invalid task ID" }, { status: 400 });
      }

      const body = await request.json();

      // Check if task exists
      const existingTask = await db.query.tasks.findFirst({
        where: eq(tasks.id, taskIdNum),
      });

      if (!existingTask) {
        return json({ error: "Task not found" }, { status: 404 });
      }

      // Update task
      const updatedTask = await db
        .update(tasks)
        .set({
          title: body.title || existingTask.title,
          description:
            body.description !== undefined
              ? body.description
              : existingTask.description,
          status: body.status || existingTask.status,
          priority: body.priority || existingTask.priority,
          projectId: body.projectId
            ? parseInt(body.projectId, 10)
            : existingTask.projectId,
          dueDate: body.dueDate ? new Date(body.dueDate) : existingTask.dueDate,
          updatedAt: new Date(),
        })
        .where(eq(tasks.id, taskIdNum))
        .returning();

      return json({ task: updatedTask[0] });
    } catch (error) {
      console.error("Error updating task:", error);
      return json({ error: "Failed to update task" }, { status: 500 });
    }
  },

  DELETE: async ({ request, params }) => {
    try {
      const { taskId } = params;

      // Ensure taskId is a valid number
      const taskIdNum = parseInt(taskId, 10);
      if (isNaN(taskIdNum)) {
        return json({ error: "Invalid task ID" }, { status: 400 });
      }

      const deletedTask = await db
        .delete(tasks)
        .where(eq(tasks.id, taskIdNum))
        .returning();

      if (deletedTask.length === 0) {
        return json({ error: "Task not found" }, { status: 404 });
      }

      return json({ message: "Task deleted successfully" });
    } catch (error) {
      console.error("Error deleting task:", error);
      return json({ error: "Failed to delete task" }, { status: 500 });
    }
  },
});

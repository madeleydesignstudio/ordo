import { json } from "@tanstack/start";
import { createAPIFileRoute } from "@tanstack/start/api";
import { db } from "../../../db/db";
import { projects, tasks } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const APIRoute = createAPIFileRoute("/api/projects/$projectSlug")({
  GET: async ({ request, params }) => {
    try {
      const { projectSlug } = params;

      const project = await db.query.projects.findFirst({
        where: eq(projects.id, parseInt(projectSlug, 10)),
        with: {
          tasks: true,
        },
      });

      if (!project) {
        return json({ error: "Project not found" }, { status: 404 });
      }

      return json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      return json({ error: "Failed to fetch project" }, { status: 500 });
    }
  },

  POST: async ({ request, params }) => {
    try {
      const { projectSlug } = params;
      const body = await request.json();

      // Validate required fields
      if (!body.title) {
        return json({ error: "Title is required" }, { status: 400 });
      }

      // Check if project exists
      const project = await db.query.projects.findFirst({
        where: eq(projects.id, parseInt(projectSlug, 10)),
      });

      if (!project) {
        return json({ error: "Project not found" }, { status: 404 });
      }

      // Create new task
      const newTask = await db
        .insert(tasks)
        .values({
          title: body.title,
          description: body.description || null,
          status: body.status || "todo",
          priority: body.priority || "medium",
          projectId: parseInt(projectSlug, 10),
          dueDate: body.dueDate ? new Date(body.dueDate) : null,
        })
        .returning();

      return json({ task: newTask[0] }, { status: 201 });
    } catch (error) {
      console.error("Error creating task:", error);
      return json({ error: "Failed to create task" }, { status: 500 });
    }
  },

  DELETE: async ({ request, params }) => {
    try {
      const { projectSlug } = params;
      const { searchParams } = new URL(request.url);
      const taskId = searchParams.get("taskId");

      // If taskId is provided, delete the specific task
      if (taskId) {
        const deletedTask = await db
          .delete(tasks)
          .where(eq(tasks.id, parseInt(taskId, 10)))
          .returning();

        if (deletedTask.length === 0) {
          return json({ error: "Task not found" }, { status: 404 });
        }

        return json({ message: "Task deleted successfully" });
      }

      // Otherwise, delete the entire project
      const deletedProject = await db
        .delete(projects)
        .where(eq(projects.id, parseInt(projectSlug, 10)))
        .returning();

      if (deletedProject.length === 0) {
        return json({ error: "Project not found" }, { status: 404 });
      }

      return json({ message: "Project deleted successfully" });
    } catch (error) {
      console.error("Error deleting:", error);
      return json({ error: "Failed to delete" }, { status: 500 });
    }
  },
});

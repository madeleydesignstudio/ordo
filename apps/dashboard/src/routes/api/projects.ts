import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { db } from "~/lib/server/db";
import { projects } from "~/lib/server/schema";
import { desc } from "drizzle-orm";

export const APIRoute = createAPIFileRoute("/api/projects")({
  GET: async () => {
    try {
      const allProjects = await db.query.projects.findMany({
        with: {
          tasks: true,
        },
        orderBy: [desc(projects.createdAt)],
      });

      return json({ projects: allProjects });
    } catch (error) {
      console.error("Error fetching projects:", error);
      return json({ error: "Failed to fetch projects" }, { status: 500 });
    }
  },

  POST: async ({ request }) => {
    try {
      const body = await request.json();

      // Validate required fields
      if (!body.name) {
        return json({ error: "Project name is required" }, { status: 400 });
      }

      // Create new project
      const newProject = await db
        .insert(projects)
        .values({
          name: body.name,
          description: body.description || null,
          status: body.status || "not_started",
          startDate: body.startDate ? new Date(body.startDate) : new Date(),
          dueDate: body.dueDate ? new Date(body.dueDate) : null,
        })
        .returning();

      return json({ project: newProject[0] }, { status: 201 });
    } catch (error) {
      console.error("Error creating project:", error);
      return json({ error: "Failed to create project" }, { status: 500 });
    }
  },
});

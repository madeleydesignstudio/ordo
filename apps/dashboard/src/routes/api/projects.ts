import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { db } from "../../lib/server/db";
import { project } from "../../lib/server/schema";
import { desc, eq } from "drizzle-orm";
// Revert type import, keep value import
import { auth } from "../../lib/server/auth";
// Import commented out as explicit typing failed
// import { betterAuth } from "better-auth"; 

export const APIRoute = createAPIFileRoute("/api/projects")({
  GET: async ({ request }) => {
    // Use auth.api.getSession with request headers
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    try {
      const allProjects = await db.query.project.findMany({
        where: eq(project.userId, userId),
        with: {
          tasks: true, // Keep this now that relations are defined
        },
        orderBy: [desc(project.createdAt)],
      });

      return json({ projects: allProjects });
    } catch (error) {
      console.error("Error fetching projects:", error);
      return json({ error: "Failed to fetch projects" }, { status: 500 });
    }
  },

  POST: async ({ request }) => {
    // Use auth.api.getSession with request headers
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return json({ error: "Authentication required to create a project." }, { status: 401 });
    }
    const userId = session.user.id;

    try {
      const body = await request.json();

      // Validate required fields
      if (!body.name) {
        return json({ error: "Project name is required" }, { status: 400 });
      }

      const [newProjectRaw] = await db
        .insert(project)
        .values({
          name: body.name,
          description: body.description || null,
          userId: userId,
        })
        .returning();
      
      const newProject = newProjectRaw as typeof project.$inferSelect;

      return json({ project: newProject }, { status: 201 });
    } catch (error) {
      console.error("Error creating project:", error);
      if (error instanceof Error && error.message.includes("user_id")){
         return json({ error: "Failed to create project: Missing user association. Authentication required." }, { status: 500 });
      }
      return json({ error: "Failed to create project" }, { status: 500 });
    }
  },
});

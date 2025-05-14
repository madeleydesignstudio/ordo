import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { eq, and } from "drizzle-orm";
import { db } from "../../../lib/server/db";
import { project } from "../../../lib/server/schema";
import { auth } from "../../../lib/server/auth";

export const APIRoute = createAPIFileRoute("/api/projects/$projectId")({
  // GET endpoint to fetch a single project by ID
  GET: async ({ request, params }) => {
    // Use auth.api.getSession with request headers
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.id;
    const { projectId } = params;
    
    if (!projectId) {
      return json({ error: "Project ID is required" }, { status: 400 });
    }

    try {
      console.log(`Fetching project with ID: ${projectId}`);
      
      // Fetch the project and ensure it belongs to the current user
      const projectData = await db.query.project.findFirst({
        where: and(
          eq(project.id, projectId),
          eq(project.userId, userId)
        ),
        with: {
          tasks: true,
        },
      });

      if (!projectData) {
        console.log(`Project not found for ID: ${projectId}`);
        return json({ error: "Project not found" }, { status: 404 });
      }

      console.log(`Successfully fetched project: ${projectData.name}`);
      return json({ project: projectData });
    } catch (error) {
      console.error("Error fetching project:", error);
      return json({ error: "Failed to fetch project" }, { status: 500 });
    }
  },
}); 
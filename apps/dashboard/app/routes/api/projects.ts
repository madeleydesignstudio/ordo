import { json } from "@tanstack/start";
import { createAPIFileRoute } from "@tanstack/start/api";
import { db } from "../../db/db";
import { projects } from "../../db/schema";
import { desc } from "drizzle-orm";

export const APIRoute = createAPIFileRoute("/api/projects")({
  GET: async ({ request, params }) => {
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
});

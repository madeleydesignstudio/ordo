import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { z } from 'zod'; // Import zod
import { db } from "../../lib/server/db";
import { project } from "../../lib/server/schema";
import { and, desc, eq } from "drizzle-orm";
// Revert type import, keep value import
import { auth } from "../../lib/server/auth";
// Import commented out as explicit typing failed
// import { betterAuth } from "better-auth"; 

// --- Zod Schemas for Validation ---
const updateProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).optional(), // Allow partial updates
  description: z.string().optional().nullable(),
  icon: z.string().optional(),
  bannerImage: z.string().optional().nullable(),
});

const deleteProjectSchema = z.object({
  id: z.string().uuid(),
});

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
          icon: body.icon || "📁", // Use provided icon or default
          bannerImage: body.bannerImage || null, // Use provided banner or null
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

  // --- PUT Handler for Editing Projects ---
  PUT: async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return json({ error: "Authentication required to update a project." }, { status: 401 });
    }
    const userId = session.user.id;

    try {
      const body = await request.json();
      const validation = updateProjectSchema.safeParse(body);

      if (!validation.success) {
        return json({ error: 'Invalid input', details: validation.error.formErrors }, { status: 400 });
      }

      const { id, ...updateData } = validation.data;

      // Prepare data for update, filtering out undefined values
      const dataToSet: Partial<Omit<typeof project.$inferInsert, 'id' | 'userId' | 'createdAt'>> & { updatedAt: Date } = {
          updatedAt: new Date(),
      };
      if (updateData.name !== undefined) dataToSet.name = updateData.name;
      if (updateData.description !== undefined) dataToSet.description = updateData.description;
      if (updateData.icon !== undefined) dataToSet.icon = updateData.icon;
      if (updateData.bannerImage !== undefined) dataToSet.bannerImage = updateData.bannerImage;

      if (Object.keys(dataToSet).length <= 1) {
         return json({ error: 'No update fields provided' }, { status: 400 });
      }

      // Perform the update, ensuring the project belongs to the user
      const [updatedProject] = await db
        .update(project)
        .set(dataToSet)
        .where(and(eq(project.id, id), eq(project.userId, userId))) // Ensure user owns the project
        .returning();

      if (!updatedProject) {
        // Could be not found OR not owned by user
        return json({ error: 'Project not found or you do not have permission to update it' }, { status: 404 });
      }

      return json({ project: updatedProject });

    } catch (error) {
      console.error("Error updating project:", error);
      return json({ error: "Failed to update project" }, { status: 500 });
    }
  },

  // --- DELETE Handler for Deleting Projects ---
  DELETE: async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return json({ error: "Authentication required to delete a project." }, { status: 401 });
    }
    const userId = session.user.id;

    try {
      // Expect ID in request body for consistency
      const body = await request.json(); 
      const validation = deleteProjectSchema.safeParse(body);

      if (!validation.success) {
        return json({ error: 'Invalid input: ID is required', details: validation.error.formErrors }, { status: 400 });
      }

      const { id } = validation.data;

      // Perform the delete, ensuring the project belongs to the user
      const [deletedProject] = await db
        .delete(project)
        .where(and(eq(project.id, id), eq(project.userId, userId))) // Ensure user owns the project
        .returning({ id: project.id }); // Return ID to confirm deletion

      if (!deletedProject) {
        // Could be not found OR not owned by user
        return json({ error: 'Project not found or you do not have permission to delete it' }, { status: 404 });
      }

      return json({ message: "Project deleted successfully", deletedProjectId: deletedProject.id });

    } catch (error) {
      console.error("Error deleting project:", error);
      // Check for foreign key constraints if tasks depend on projects
      // You might need more specific error handling based on DB errors
      return json({ error: "Failed to delete project" }, { status: 500 });
    }
  },
});

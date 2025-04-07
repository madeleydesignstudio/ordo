import { json } from "@tanstack/start";
import { createAPIFileRoute } from "@tanstack/start/api";
import { db } from "../../../db/db";
import { tasks } from "../../../db/schema";
import { and, gte, lte, isNotNull } from "drizzle-orm";

export const APIRoute = createAPIFileRoute("/api/tasks/by-date")({
  GET: async ({ request }) => {
    try {
      const { searchParams } = new URL(request.url);
      const startDate = searchParams.get("startDate");
      const endDate = searchParams.get("endDate");

      if (!startDate || !endDate) {
        return json(
          { error: "Start date and end date are required" },
          { status: 400 }
        );
      }

      // Convert string dates to Date objects
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Set end date to end of day
      end.setHours(23, 59, 59, 999);

      // Fetch tasks within the date range
      const tasksInRange = await db.query.tasks.findMany({
        where: and(
          isNotNull(tasks.dueDate),
          gte(tasks.dueDate, start),
          lte(tasks.dueDate, end)
        ),
        with: {
          project: true,
        },
      });

      return json({ tasks: tasksInRange });
    } catch (error) {
      console.error("Error fetching tasks by date range:", error);
      return json({ error: "Failed to fetch tasks" }, { status: 500 });
    }
  },
});

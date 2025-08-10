// src/routes/notifications.tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/notifications/")({
  component: Notifications,
});

function Notifications() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-start space-x-4">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">Welcome to Ordo</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Your account has been successfully created. Get started by
                exploring the features.
              </p>
              <p className="text-xs text-muted-foreground mt-2">2 hours ago</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-start space-x-4">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">System Update</h3>
              <p className="text-sm text-muted-foreground mt-1">
                New features have been added to the knowledge base. Check them
                out now.
              </p>
              <p className="text-xs text-muted-foreground mt-2">1 day ago</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 opacity-60">
          <div className="flex items-start space-x-4">
            <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">Project Reminder</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Don't forget to review your project milestones this week.
              </p>
              <p className="text-xs text-muted-foreground mt-2">3 days ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

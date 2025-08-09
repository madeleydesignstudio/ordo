// src/routes/projects.tsx
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@ordo/ui/components/button";

export const Route = createFileRoute("/projects")({
  component: Projects,
});

function Projects() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Project Manager</h1>
        <Button>New Project</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Website Redesign</h3>
            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
              In Progress
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Complete redesign of the company website with modern UI/UX principles.
          </p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>65%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: "65%" }}></div>
            </div>
          </div>
          <div className="flex justify-between items-center mt-4 text-xs text-muted-foreground">
            <span>Due: Dec 15, 2024</span>
            <span>5 tasks remaining</span>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Mobile App</h3>
            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
              Planning
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Development of a cross-platform mobile application for the business.
          </p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>20%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: "20%" }}></div>
            </div>
          </div>
          <div className="flex justify-between items-center mt-4 text-xs text-muted-foreground">
            <span>Due: Feb 28, 2025</span>
            <span>12 tasks remaining</span>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Database Migration</h3>
            <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
              On Hold
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Migrate legacy database to new cloud infrastructure.
          </p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>40%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-yellow-600 h-2 rounded-full" style={{ width: "40%" }}></div>
            </div>
          </div>
          <div className="flex justify-between items-center mt-4 text-xs text-muted-foreground">
            <span>Due: TBD</span>
            <span>8 tasks remaining</span>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">Project Timeline</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <p className="font-medium">Website Redesign - Phase 1 Complete</p>
              <p className="text-sm text-muted-foreground">Completed 2 days ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <div className="flex-1">
              <p className="font-medium">Mobile App - Requirements Gathering</p>
              <p className="text-sm text-muted-foreground">In progress</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <div className="flex-1">
              <p className="font-medium">Database Migration - Planning Phase</p>
              <p className="text-sm text-muted-foreground">Scheduled for next week</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

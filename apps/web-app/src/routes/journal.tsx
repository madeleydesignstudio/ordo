// src/routes/journal.tsx
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@ordo/ui/components/button";

export const Route = createFileRoute("/journal")({
  component: Journal,
});

function Journal() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Journal</h1>
        <Button>New Entry</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Today's Reflection</h3>
              <span className="text-sm text-muted-foreground">Dec 10, 2024</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Had a productive day working on the website redesign project. Made significant progress on the user interface components and received positive feedback from the team. Need to focus on the mobile responsiveness tomorrow.
            </p>
            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <span>📝 Daily Reflection</span>
              <span>•</span>
              <span>2 hours ago</span>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Project Milestone Achieved</h3>
              <span className="text-sm text-muted-foreground">Dec 9, 2024</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Successfully completed the first phase of the website redesign. The team is happy with the progress, and we're on track to meet our December deadline. Celebrating this small win before moving to the next phase.
            </p>
            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <span>🎯 Milestone</span>
              <span>•</span>
              <span>1 day ago</span>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Learning Note</h3>
              <span className="text-sm text-muted-foreground">Dec 8, 2024</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Discovered a new React pattern for state management that could be useful for our current projects. The pattern uses custom hooks to encapsulate complex state logic and makes components more reusable.
            </p>
            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <span>💡 Learning</span>
              <span>•</span>
              <span>2 days ago</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold mb-3">Entry Types</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 p-2 rounded hover:bg-accent cursor-pointer">
                <span>📝</span>
                <span className="text-sm">Daily Reflection</span>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded hover:bg-accent cursor-pointer">
                <span>🎯</span>
                <span className="text-sm">Milestone</span>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded hover:bg-accent cursor-pointer">
                <span>💡</span>
                <span className="text-sm">Learning</span>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded hover:bg-accent cursor-pointer">
                <span>🚀</span>
                <span className="text-sm">Goal</span>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded hover:bg-accent cursor-pointer">
                <span>🔍</span>
                <span className="text-sm">Analysis</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold mb-3">This Month</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total Entries</span>
                <span className="font-medium">18</span>
              </div>
              <div className="flex justify-between">
                <span>Streak Days</span>
                <span className="font-medium">7</span>
              </div>
              <div className="flex justify-between">
                <span>Goals Achieved</span>
                <span className="font-medium">3</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                Daily Check-in
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                Weekly Review
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                Set New Goal
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

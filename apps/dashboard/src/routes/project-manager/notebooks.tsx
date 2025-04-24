import { createFileRoute } from "@tanstack/react-router";
import { Construction } from "lucide-react";
import { Clock } from "lucide-react";

export const Route = createFileRoute("/project-manager/notebooks")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex h-full flex-col items-center justify-center space-y-6 text-center">
      <div className="flex items-center space-x-2 text-muted-foreground">
        <Construction className="h-12 w-12 animate-pulse" />
        <Clock className="h-12 w-12 animate-pulse" />
      </div>

      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tighter">Coming Soon</h1>
        <p className="text-lg text-muted-foreground">
          We're working hard to bring you the My Issues feature.
        </p>
      </div>

      <div className="max-w-sm text-sm text-muted-foreground">
        This section will allow you to view and manage all issues assigned to
        you across different projects.
      </div>
    </div>
  );
}

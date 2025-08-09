// src/routes/knowledge.tsx
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@ordo/ui/components/button";

export const Route = createFileRoute("/knowledge/")({
  component: Knowledge,
});

function Knowledge() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
        <Button>Add Article</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Categories</h2>
          <div className="space-y-2">
            <div className="p-3 rounded-lg border bg-card hover:bg-accent cursor-pointer">
              <h3 className="font-medium">Getting Started</h3>
              <p className="text-sm text-muted-foreground">5 articles</p>
            </div>
            <div className="p-3 rounded-lg border bg-card hover:bg-accent cursor-pointer">
              <h3 className="font-medium">Best Practices</h3>
              <p className="text-sm text-muted-foreground">12 articles</p>
            </div>
            <div className="p-3 rounded-lg border bg-card hover:bg-accent cursor-pointer">
              <h3 className="font-medium">Troubleshooting</h3>
              <p className="text-sm text-muted-foreground">8 articles</p>
            </div>
            <div className="p-3 rounded-lg border bg-card hover:bg-accent cursor-pointer">
              <h3 className="font-medium">API Reference</h3>
              <p className="text-sm text-muted-foreground">15 articles</p>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Articles</h2>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold hover:text-primary cursor-pointer">
                    How to Set Up Your First Project
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    A comprehensive guide to getting started with project
                    management in Ordo.
                  </p>
                  <div className="flex items-center space-x-4 mt-3 text-xs text-muted-foreground">
                    <span>Getting Started</span>
                    <span>•</span>
                    <span>Updated 2 days ago</span>
                    <span>•</span>
                    <span>5 min read</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold hover:text-primary cursor-pointer">
                    Advanced Task Management Techniques
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Learn how to optimize your workflow with advanced task
                    management features.
                  </p>
                  <div className="flex items-center space-x-4 mt-3 text-xs text-muted-foreground">
                    <span>Best Practices</span>
                    <span>•</span>
                    <span>Updated 1 week ago</span>
                    <span>•</span>
                    <span>8 min read</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold hover:text-primary cursor-pointer">
                    API Integration Guide
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Step-by-step instructions for integrating with external APIs
                    and services.
                  </p>
                  <div className="flex items-center space-x-4 mt-3 text-xs text-muted-foreground">
                    <span>API Reference</span>
                    <span>•</span>
                    <span>Updated 2 weeks ago</span>
                    <span>•</span>
                    <span>12 min read</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

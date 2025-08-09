// src/routes/index.tsx
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@ordo/ui/components/button";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-foreground mb-8">
          UI Component Testing
        </h1>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Button Variants
          </h2>

          <div className="flex flex-wrap gap-4">
            <Button>Default Button</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Button Sizes
          </h2>

          <div className="flex flex-wrap items-center gap-4">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon">🎯</Button>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Interactive Examples
          </h2>

          <div className="flex flex-wrap gap-4">
            <Button onClick={() => alert("Button clicked!")}>Click Me</Button>
            <Button disabled>Disabled Button</Button>
            <Button variant="outline" onClick={() => console.log("Logged!")}>
              Log to Console
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

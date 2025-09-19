import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@ordo/ui/components/button";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="text-red-400">
      Hello dfss
      <Button variant={"destructive"}>Click me</Button>
    </div>
  );
}

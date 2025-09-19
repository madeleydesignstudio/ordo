import { createFileRoute } from "@tanstack/react-router";
import { TodoApp } from "../components/TodoApp";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen bg-background">
      <TodoApp />
    </div>
  );
}

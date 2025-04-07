import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

type Project = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  tasks: Array<{
    id: string;
    title: string;
    completed: boolean;
  }>;
};

export const Route = createFileRoute("/project-manager/projects")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data, isLoading, isError, error } = useQuery<{ projects: Project[] }>(
    {
      queryKey: ["projects"],
      queryFn: async () => {
        const response = await fetch("/api/projects");
        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }
        return response.json();
      },
    }
  );

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error?.message}</div>;

  return (
    <div>
      <h1>Projects</h1>
      <div className="grid gap-4">
        {data?.projects.map((project) => (
          <div key={project.id} className="p-4 border rounded-lg">
            <h2 className="text-lg font-bold">{project.name}</h2>
            <p>{project.description}</p>
            <p className="text-sm text-gray-500">
              Tasks: {project.tasks.length}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

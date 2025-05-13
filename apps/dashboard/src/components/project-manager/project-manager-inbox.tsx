import React, { useEffect, useState } from "react";
import ProjectLayout from "~/components/project-manager/project-layout";
import { Task, Project, ProjectData } from "~/components/project-manager/project-layout";

const ProjectManagerInbox = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch tasks
        const tasksResponse = await fetch("/api/tasks/my-tasks");
        if (!tasksResponse.ok) {
          throw new Error(`Error fetching tasks: ${tasksResponse.status}`);
        }
        const tasksData = await tasksResponse.json();
        setTasks(tasksData || []);

        // Fetch projects
        const projectsResponse = await fetch("/api/projects");
        if (!projectsResponse.ok) {
          throw new Error(`Error fetching projects: ${projectsResponse.status}`);
        }
        const projectsData = await projectsResponse.json();
        setProjects(projectsData.projects || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error fetching data");
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Prepare data for layout
  const layoutData: ProjectData = {
    tasks,
    projects
  };

  return (
    <div className="h-[92.5%] w-full p-2.5">
      {error && (
        <div className="p-4 bg-red-900/20 border border-red-700 rounded-md mb-4">
          <p className="text-red-400">Error: {error}</p>
        </div>
      )}
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-neutral-400">Loading...</p>
        </div>
      ) : (
        <ProjectLayout data={layoutData} />
      )}
    </div>
  );
};

export default ProjectManagerInbox;

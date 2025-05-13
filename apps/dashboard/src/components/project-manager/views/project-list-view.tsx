import React from "react";
import { ProjectData } from "../project-layout";

interface ProjectListViewProps {
  data?: ProjectData;
}

const ProjectListView: React.FC<ProjectListViewProps> = ({ data }) => {
  const projects = data?.projects || [];
  const tasks = data?.tasks || [];

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Projects & Tasks</h2>
      
      {/* Projects section */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-2">Projects</h3>
        {projects.length === 0 ? (
          <p className="text-neutral-400">No projects found</p>
        ) : (
          <ul className="space-y-2">
            {projects.map((project) => (
              <li key={project.id} className="border border-neutral-700 p-3 rounded-md bg-neutral-800">
                <h4 className="font-medium text-neutral-200">{project.name}</h4>
                {project.description && (
                  <p className="text-sm text-neutral-400 mt-1">{project.description}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Tasks section */}
      <div>
        <h3 className="text-lg font-medium mb-2">Tasks</h3>
        {tasks.length === 0 ? (
          <p className="text-neutral-400">No tasks found</p>
        ) : (
          <ul className="space-y-2">
            {tasks.map((task) => (
              <li key={task.id} className="border border-neutral-700 p-3 rounded-md bg-neutral-800">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-neutral-200">{task.title}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    task.status === 'todo' ? 'bg-blue-900 text-blue-300' :
                    task.status === 'in_progress' ? 'bg-yellow-900 text-yellow-300' :
                    task.status === 'done' ? 'bg-green-900 text-green-300' :
                    'bg-neutral-700 text-neutral-300'
                  }`}>
                    {task.status}
                  </span>
                </div>
                {task.description && (
                  <p className="text-sm text-neutral-400 mt-1">{task.description}</p>
                )}
                {task.dueDate && (
                  <p className="text-xs text-neutral-500 mt-2">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ProjectListView; 
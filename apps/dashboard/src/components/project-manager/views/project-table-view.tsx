import React, { useState } from "react";
import { Task, ProjectData } from "../project-layout";

interface ProjectTableViewProps {
  data?: ProjectData;
}

const ProjectTableView: React.FC<ProjectTableViewProps> = ({ data }) => {
  const tasks = data?.tasks || [];
  const projects = data?.projects || [];
  const [sortField, setSortField] = useState<keyof Task>("title");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Get project name by ID
  const getProjectName = (projectId?: string | null) => {
    if (!projectId) return "—";
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : "Unknown Project";
  };

  // Format date for display
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString();
  };

  // Handle sort
  const handleSort = (field: keyof Task) => {
    if (field === sortField) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Sort tasks
  const sortedTasks = [...tasks].sort((a, b) => {
    if (sortField === "dueDate") {
      // Handle null dates
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return sortDirection === "asc" ? 1 : -1;
      if (!b.dueDate) return sortDirection === "asc" ? -1 : 1;
      
      const dateA = new Date(a.dueDate);
      const dateB = new Date(b.dueDate);
      return sortDirection === "asc" 
        ? dateA.getTime() - dateB.getTime() 
        : dateB.getTime() - dateA.getTime();
    }
    
    // Handle other fields
    const valueA = a[sortField] || "";
    const valueB = b[sortField] || "";
    
    if (typeof valueA === "string" && typeof valueB === "string") {
      return sortDirection === "asc" 
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }
    
    return 0;
  });

  // Render sort indicator
  const renderSortIndicator = (field: keyof Task) => {
    if (field !== sortField) return null;
    return sortDirection === "asc" ? " ↑" : " ↓";
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Tasks Table</h2>
      
      <div className="border border-neutral-700 rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-800">
            <tr>
              <th 
                className="p-2 text-left text-neutral-300 border-b border-neutral-700 cursor-pointer hover:bg-neutral-700"
                onClick={() => handleSort("title")}
              >
                Task{renderSortIndicator("title")}
              </th>
              <th 
                className="p-2 text-left text-neutral-300 border-b border-neutral-700 cursor-pointer hover:bg-neutral-700"
                onClick={() => handleSort("status")}
              >
                Status{renderSortIndicator("status")}
              </th>
              <th 
                className="p-2 text-left text-neutral-300 border-b border-neutral-700 cursor-pointer hover:bg-neutral-700"
                onClick={() => handleSort("priority")}
              >
                Priority{renderSortIndicator("priority")}
              </th>
              <th 
                className="p-2 text-left text-neutral-300 border-b border-neutral-700 cursor-pointer hover:bg-neutral-700"
                onClick={() => handleSort("dueDate")}
              >
                Due Date{renderSortIndicator("dueDate")}
              </th>
              <th className="p-2 text-left text-neutral-300 border-b border-neutral-700">
                Project
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedTasks.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-neutral-400">
                  No tasks found
                </td>
              </tr>
            ) : (
              sortedTasks.map((task) => (
                <tr 
                  key={task.id} 
                  className="border-b border-neutral-700 hover:bg-neutral-800/50 cursor-pointer"
                >
                  <td className="p-2">
                    <div className="font-medium text-neutral-200">{task.title}</div>
                    {task.description && (
                      <div className="text-xs text-neutral-400 mt-1 line-clamp-1">
                        {task.description}
                      </div>
                    )}
                  </td>
                  <td className="p-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      task.status === 'todo' ? 'bg-blue-900/30 text-blue-300' :
                      task.status === 'in_progress' ? 'bg-yellow-900/30 text-yellow-300' :
                      task.status === 'done' ? 'bg-green-900/30 text-green-300' :
                      'bg-neutral-700 text-neutral-300'
                    }`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-2">
                    {task.priority ? (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        task.priority === 'low' ? 'bg-blue-900/30 text-blue-300' :
                        task.priority === 'medium' ? 'bg-yellow-900/30 text-yellow-300' :
                        task.priority === 'high' ? 'bg-orange-900/30 text-orange-300' :
                        task.priority === 'urgent' ? 'bg-red-900/30 text-red-300' :
                        'bg-neutral-700 text-neutral-400'
                      }`}>
                        {task.priority}
                      </span>
                    ) : (
                      <span className="text-neutral-500">—</span>
                    )}
                  </td>
                  <td className="p-2 text-neutral-300">
                    {formatDate(task.dueDate)}
                  </td>
                  <td className="p-2 text-neutral-300">
                    {getProjectName(task.projectId)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectTableView; 
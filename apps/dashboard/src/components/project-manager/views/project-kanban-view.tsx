import React from "react";
import { Task, ProjectData } from "../project-layout";

interface ProjectKanbanViewProps {
  data?: ProjectData;
}

const ProjectKanbanView: React.FC<ProjectKanbanViewProps> = ({ data }) => {
  const tasks = data?.tasks || [];
  
  // Group tasks by status
  const todoTasks = tasks.filter(task => task.status === 'todo');
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress');
  const doneTasks = tasks.filter(task => task.status === 'done');

  // Render a task card
  const renderTaskCard = (task: Task) => (
    <div 
      key={task.id} 
      className="bg-neutral-800 p-3 rounded-md border border-neutral-700 mb-2 cursor-grab"
    >
      <h4 className="font-medium text-neutral-200 text-sm">{task.title}</h4>
      {task.description && (
        <p className="text-xs text-neutral-400 mt-1 line-clamp-2">{task.description}</p>
      )}
      {task.dueDate && (
        <div className="flex items-center mt-2">
          <span className="text-xs text-neutral-500">
            Due: {new Date(task.dueDate).toLocaleDateString()}
          </span>
        </div>
      )}
      {task.priority && (
        <div className="mt-2">
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            task.priority === 'low' ? 'bg-blue-900/30 text-blue-300' :
            task.priority === 'medium' ? 'bg-yellow-900/30 text-yellow-300' :
            task.priority === 'high' ? 'bg-orange-900/30 text-orange-300' :
            task.priority === 'urgent' ? 'bg-red-900/30 text-red-300' :
            'bg-neutral-700 text-neutral-400'
          }`}>
            {task.priority}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Project Kanban Board</h2>
      
      <div className="grid grid-cols-3 gap-4 mt-4">
        {/* To Do Column */}
        <div className="bg-neutral-900/50 p-3 rounded-md">
          <h3 className="font-medium text-neutral-300 mb-3 pb-2 border-b border-neutral-700 flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            To Do
            <span className="ml-2 bg-neutral-800 text-neutral-400 text-xs px-2 py-0.5 rounded-full">
              {todoTasks.length}
            </span>
          </h3>
          <div className="min-h-[200px]">
            {todoTasks.length === 0 ? (
              <p className="text-neutral-500 text-sm">No tasks</p>
            ) : (
              todoTasks.map(renderTaskCard)
            )}
          </div>
        </div>
        
        {/* In Progress Column */}
        <div className="bg-neutral-900/50 p-3 rounded-md">
          <h3 className="font-medium text-neutral-300 mb-3 pb-2 border-b border-neutral-700 flex items-center">
            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
            In Progress
            <span className="ml-2 bg-neutral-800 text-neutral-400 text-xs px-2 py-0.5 rounded-full">
              {inProgressTasks.length}
            </span>
          </h3>
          <div className="min-h-[200px]">
            {inProgressTasks.length === 0 ? (
              <p className="text-neutral-500 text-sm">No tasks</p>
            ) : (
              inProgressTasks.map(renderTaskCard)
            )}
          </div>
        </div>
        
        {/* Done Column */}
        <div className="bg-neutral-900/50 p-3 rounded-md">
          <h3 className="font-medium text-neutral-300 mb-3 pb-2 border-b border-neutral-700 flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Done
            <span className="ml-2 bg-neutral-800 text-neutral-400 text-xs px-2 py-0.5 rounded-full">
              {doneTasks.length}
            </span>
          </h3>
          <div className="min-h-[200px]">
            {doneTasks.length === 0 ? (
              <p className="text-neutral-500 text-sm">No tasks</p>
            ) : (
              doneTasks.map(renderTaskCard)
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectKanbanView; 
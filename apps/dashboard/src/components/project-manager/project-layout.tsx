import React, { createContext, useContext, useState, useEffect } from "react";
import ProjectListView from "./views/project-list-view";
import ProjectKanbanView from "./views/project-kanban-view";
import ProjectCalendarView from "./views/project-calendar-view";
import ProjectTableView from "./views/project-table-view";

// Define shared types
export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  dueDate?: string | null;
  priority?: string;
  projectId?: string | null;
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
}

export interface ProjectData {
  projects?: Project[];
  tasks?: Task[];
}

export type ProjectLayoutView = "list" | "kanban" | "calendar" | "table";

type ProjectLayoutContextType = {
  currentView: ProjectLayoutView;
  setCurrentView: (view: ProjectLayoutView) => void;
};

const ProjectLayoutContext = createContext<ProjectLayoutContextType | undefined>(undefined);

export const useProjectLayout = () => {
  const context = useContext(ProjectLayoutContext);
  if (!context) {
    throw new Error("useProjectLayout must be used within a ProjectLayoutProvider");
  }
  return context;
};

export const ProjectLayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<ProjectLayoutView>("list");

  // Listen for custom view change events from ContentTabs
  useEffect(() => {
    const handleViewChange = (event: CustomEvent<{ view: ProjectLayoutView }>) => {
      console.log('Layout view change event received:', event.detail.view);
      setCurrentView(event.detail.view);
    };

    // Add event listener
    document.addEventListener(
      'project-layout-view-change', 
      handleViewChange as EventListener
    );

    // Clean up event listener
    return () => {
      document.removeEventListener(
        'project-layout-view-change', 
        handleViewChange as EventListener
      );
    };
  }, []);

  return (
    <ProjectLayoutContext.Provider value={{ currentView, setCurrentView }}>
      {children}
    </ProjectLayoutContext.Provider>
  );
};

interface ProjectLayoutProps {
  data?: ProjectData;
}

const ProjectLayout: React.FC<ProjectLayoutProps> = ({ data }) => {
  const { currentView } = useProjectLayout();

  // Render the appropriate view based on currentView
  switch (currentView) {
    case "list":
      return <ProjectListView data={data} />;
    case "kanban":
      return <ProjectKanbanView data={data} />;
    case "calendar":
      return <ProjectCalendarView data={data} />;
    case "table":
      return <ProjectTableView data={data} />;
    default:
      return <ProjectListView data={data} />;
  }
};

export default ProjectLayout; 
import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./App.css";

// Import all components
import ProjectsTable from "./components/ProjectsTable";
import TasksTable from "./components/TasksTable";
import UsersTable from "./components/UsersTable";
import CreateProjectForm from "./components/CreateProjectForm";
import CreateTaskForm from "./components/CreateTaskForm";
import CreateUserForm from "./components/CreateUserForm";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity, // Since Electric SQL handles the real-time updates
      refetchOnWindowFocus: false,
    },
  },
});

type Tab = "projects" | "tasks" | "users";

// Tab navigation component
function TabNavigation({
  activeTab,
  onTabChange,
}: {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}) {
  const tabs = [
    { id: "projects" as Tab, name: "Projects", icon: "📋" },
    { id: "tasks" as Tab, name: "Tasks", icon: "✅" },
    { id: "users" as Tab, name: "Users", icon: "👥" },
  ];

  return (
    <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors duration-200
            ${
              activeTab === tab.id
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"
            }
          `}
        >
          <span>{tab.icon}</span>
          <span>{tab.name}</span>
        </button>
      ))}
    </nav>
  );
}

// Main App component
function App() {
  const [activeTab, setActiveTab] = useState<Tab>("projects");

  const renderContent = () => {
    switch (activeTab) {
      case "projects":
        return (
          <>
            <CreateProjectForm />
            <ProjectsTable />
          </>
        );
      case "tasks":
        return (
          <>
            <CreateTaskForm />
            <TasksTable />
          </>
        );
      case "users":
        return (
          <>
            <CreateUserForm />
            <UsersTable />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Ordo Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Project management with real-time sync powered by Electric SQL
              </p>
            </header>

            <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

            {renderContent()}
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;

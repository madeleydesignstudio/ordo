import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./App.css";

// Import all components
import CreateProjectForm from "./components/CreateProjectForm";
import CreateTaskForm from "./components/CreateTaskForm";
import CreateUserForm from "./components/CreateUserForm";
import ProjectsTable from "./components/ProjectsTable";
import TasksTable from "./components/TasksTable";
import UsersTable from "./components/UsersTable";
import Login from "./components/Login";
import OAuthCallback from "./components/OAuthCallback";
import UserProfile from "./components/UserProfile";
import PGTaskTable from "./components/PGTaskTable";

import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./hooks/useAuth";

import { PGlite } from "@electric-sql/pglite";
import { PGliteProvider } from "@electric-sql/pglite-react";
import { electricSync } from "@electric-sql/pglite-sync";
import { live } from "@electric-sql/pglite/live";
import { useState, useEffect } from "react";
// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity, // Since Electric SQL handles the real-time updates
      refetchOnWindowFocus: false,
    },
  },
});

type Tab = "projects" | "tasks" | "users" | "pgtasks";

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
    { id: "pgtasks" as Tab, name: "PG Tasks", icon: "⚡" },
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

// Initialize PGlite database
let pgInstancePromise: Promise<PGlite> | null = null;

const initializePGlite = async (): Promise<PGlite> => {
  if (!pgInstancePromise) {
    pgInstancePromise = PGlite.create({
      dataDir: "idb://ordo-tasks-sync-db",
      extensions: {
        electric: electricSync(),
        live,
      },
    });
  }
  return pgInstancePromise;
};

// Main App component content (authenticated)
function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("projects");
  const [pgDb, setPgDb] = useState<PGlite | null>(null);
  const [pgError, setPgError] = useState<string | null>(null);

  // Initialize PGlite when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      initializePGlite()
        .then((db) => {
          setPgDb(db);
          console.log("PGlite initialized successfully in App.tsx");
        })
        .catch((err) => {
          console.error("Failed to initialize PGlite:", err);
          setPgError(
            err instanceof Error ? err.message : "Failed to initialize PGlite",
          );
        });
    }
  }, [isAuthenticated]);

  // Check for OAuth callback parameters
  const urlParams = new URLSearchParams(window.location.search);
  const isCallbackScenario = urlParams.has("token") || urlParams.has("error");

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show OAuth callback handler if we have callback data
  if (isCallbackScenario) {
    return <OAuthCallback />;
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Login />;
  }

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
      case "pgtasks":
        return <PGTaskTable />;
      default:
        return null;
    }
  };

  // Show PGlite initialization error if there is one
  if (pgError) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-red-800">
                Database Initialization Error
              </h3>
              <p className="mt-2 text-sm text-red-700">{pgError}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading for PGlite initialization
  if (isAuthenticated && !pgDb) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Initializing database...</p>
        </div>
      </div>
    );
  }

  const content = (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <UserProfile />

          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Ordo Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Project management with real-time sync powered by Electric SQL
            </p>
          </header>

          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

          {renderContent()}
        </div>
      </div>
    </div>
  );

  // Wrap with PGliteProvider if we have the database instance
  return pgDb ? <PGliteProvider db={pgDb}>{content}</PGliteProvider> : content;
}

// Main App wrapper with providers
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { todoService, type Todo } from "../lib/todoService";

const DEFAULT_TODO_NAME = "Arthur";
const DEFAULT_USER_ID = "user-123"; // TODO: Replace with actual user ID from auth
const TOP_TODOS_LIMIT = 3;

// Build timestamp for cache busting
declare const __BUILD_TIMESTAMP__: number;

export function TodoApp() {
  const queryClient = useQueryClient();
  const [newTodoName, setNewTodoName] = useState(DEFAULT_TODO_NAME);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // OFFLINE-FIRST: Remove cache invalidation for true offline operation
  useEffect(() => {
    // Only store build timestamp, no network-dependent cache operations
    const currentBuildTimestamp = __BUILD_TIMESTAMP__.toString();
    const storedTimestamp = localStorage.getItem("buildTimestamp");

    if (!storedTimestamp) {
      localStorage.setItem("buildTimestamp", currentBuildTimestamp);
      console.log("📦 Stored initial build timestamp for offline operation");
    }

    // No cache clearing - let service worker handle cache management
    // This ensures the app works completely offline from first load
  }, []);

  const {
    data: todos = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["todos"],
    queryFn: () => todoService.getAllTodos(),
  });

  const { data: stats } = useQuery({
    queryKey: ["todo-stats"],
    queryFn: () => todoService.getTodoStats(),
  });

  const { data: topTodos = [] } = useQuery({
    queryKey: ["top-todos"],
    queryFn: () => todoService.getTopTodos(TOP_TODOS_LIMIT),
  });

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["todos"] });
    queryClient.invalidateQueries({ queryKey: ["todo-stats"] });
    queryClient.invalidateQueries({ queryKey: ["top-todos"] });
  };

  const createMutation = useMutation({
    mutationFn: (todo: { name: string; number: number }) =>
      todoService.createTodo(todo),
    onSuccess: invalidateQueries,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => todoService.deleteTodo(id),
    onSuccess: invalidateQueries,
  });

  const clearAllMutation = useMutation({
    mutationFn: () => todoService.clearAllTodos(),
    onSuccess: invalidateQueries,
  });

  const pushToCloudMutation = useMutation({
    mutationFn: () => {
      if (!isOnline) {
        throw new Error("Cannot sync to cloud while offline");
      }
      return todoService.pushToCloud(DEFAULT_USER_ID);
    },
    onSuccess: (result) => {
      if (result.success) {
        // Could add a toast notification here in the future
        console.log(`Successfully synced ${result.count} todos to cloud`);
      }
    },
    onError: (error) => {
      console.error("Failed to sync to cloud:", error);
      // Could add error toast notification here in the future
    },
  });

  const generateRandomNumber = () => Math.floor(Math.random() * 100);

  const handleAddTodo = () => {
    if (!newTodoName.trim()) return;

    createMutation.mutate({
      name: newTodoName,
      number: generateRandomNumber(),
    });
  };

  const handleDeleteTodo = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleClearAll = () => {
    clearAllMutation.mutate();
  };

  const handlePushToCloud = () => {
    pushToCloudMutation.mutate();
  };

  if (isLoading) {
    return <div style={{ padding: "20px" }}>Loading todos...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: "20px", color: "red" }}>
        Error loading todos: {(error as Error).message}
      </div>
    );
  }

  const handleManualSync = async () => {
    if (!isOnline) {
      alert("Cannot sync while offline. Connect to internet and try again.");
      return;
    }
    pushToCloudMutation.mutate();
  };

  const checkForUpdates = async () => {
    if (!isOnline) {
      alert("Cannot check for updates while offline.");
      return;
    }

    try {
      const response = await fetch(`/version.json?t=${Date.now()}`, {
        cache: "no-store",
      });
      if (response.ok) {
        const serverVersion = await response.json();
        const storedVersion = localStorage.getItem("app_version");

        if (storedVersion && serverVersion.version !== storedVersion) {
          if (confirm("New version available! Refresh to update?")) {
            localStorage.setItem("app_version", serverVersion.version);
            window.location.reload();
          }
        } else {
          alert("You're running the latest version!");
        }
      }
    } catch (error) {
      alert("Failed to check for updates");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "system-ui" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <div>
          <h2>📝 Offline-First Todo App</h2>
          <p style={{ color: "#666", margin: "0" }}>
            TanStack Query + PGLite • Works completely offline!
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <div
            style={{
              padding: "4px 8px",
              borderRadius: "12px",
              fontSize: "12px",
              fontWeight: "bold",
              backgroundColor: isOnline ? "#22c55e" : "#ef4444",
              color: "white",
            }}
          >
            {isOnline ? "🌐 Online" : "📴 Offline"}
          </div>
          <button
            onClick={checkForUpdates}
            disabled={!isOnline}
            style={{
              padding: "4px 8px",
              fontSize: "12px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              background: isOnline ? "white" : "#f5f5f5",
              color: isOnline ? "#666" : "#999",
              cursor: isOnline ? "pointer" : "not-allowed",
            }}
            title={
              isOnline
                ? "Check for app updates"
                : "Go online to check for updates"
            }
          >
            🔄 Updates
          </button>
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          value={newTodoName}
          onChange={(e) => setNewTodoName(e.target.value)}
          placeholder="Enter todo name"
          style={{
            padding: "8px",
            marginRight: "10px",
            border: "1px solid #ddd",
            borderRadius: "4px",
          }}
        />
        <button
          onClick={handleAddTodo}
          disabled={createMutation.isPending || !newTodoName.trim()}
          style={{ marginRight: "10px" }}
        >
          {createMutation.isPending ? "Adding..." : "➕ Add Todo"}
        </button>
        <button onClick={handleClearAll} disabled={clearAllMutation.isPending}>
          {clearAllMutation.isPending ? "Clearing..." : "🗑️ Clear All"}
        </button>
        <button
          onClick={handleManualSync}
          disabled={
            pushToCloudMutation.isPending || todos.length === 0 || !isOnline
          }
          style={{
            marginLeft: "10px",
            backgroundColor: !isOnline
              ? "#999"
              : pushToCloudMutation.isError
                ? "#ff4444"
                : pushToCloudMutation.isSuccess
                  ? "#4caf50"
                  : "#4F46E5",
            color: "white",
            border: "none",
            padding: "8px 12px",
            borderRadius: "4px",
            cursor:
              !isOnline || pushToCloudMutation.isPending
                ? "not-allowed"
                : "pointer",
            opacity: !isOnline ? 0.6 : 1,
          }}
          title={
            !isOnline
              ? "Go online to sync todos to cloud"
              : pushToCloudMutation.isError
                ? "Sync failed - click to retry"
                : pushToCloudMutation.isSuccess
                  ? "Sync successful!"
                  : "Sync todos to cloud"
          }
        >
          {!isOnline
            ? "📴 Offline"
            : pushToCloudMutation.isPending
              ? "⏳ Syncing..."
              : pushToCloudMutation.isError
                ? "❌ Retry"
                : pushToCloudMutation.isSuccess
                  ? "✅ Synced"
                  : "☁️ Sync"}
        </button>
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}
      >
        <div>
          <h3>🚀 All Todos ({todos.length})</h3>
          {todos.length === 0 ? (
            <p style={{ color: "#666" }}>No todos yet. Add some!</p>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {todos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onDelete={handleDeleteTodo}
                  isDeleting={deleteMutation.isPending}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <h3>📊 Analytics</h3>
          <TodoStats stats={stats} />
          <TopTodosList todos={topTodos} />
        </div>
      </div>

      <AppBenefits />
    </div>
  );
}

interface TodoItemProps {
  todo: Todo;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

function TodoItem({ todo, onDelete, isDeleting }: TodoItemProps) {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "4px",
        padding: "12px",
        backgroundColor: "#f9f9f9",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div>
        <div>
          <strong>{todo.name}</strong> ({todo.number})
        </div>
        <div style={{ fontSize: "12px", color: "#666" }}>
          {todo.createdAt.toLocaleString()}
        </div>
      </div>
      <button
        onClick={() => onDelete(todo.id)}
        disabled={isDeleting}
        style={{
          background: "#ff4444",
          color: "white",
          border: "none",
          padding: "4px 8px",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        ❌
      </button>
    </div>
  );
}

interface TodoStatsProps {
  stats?: { count: number; avgNumber: number };
}

function TodoStats({ stats }: TodoStatsProps) {
  return (
    <div style={{ marginBottom: "15px" }}>
      <strong>Stats:</strong>
      <br />
      Total: {stats?.count || 0} todos
      <br />
      Average number: {stats?.avgNumber || 0}
    </div>
  );
}

interface TopTodosListProps {
  todos: Todo[];
}

function TopTodosList({ todos }: TopTodosListProps) {
  return (
    <div>
      <strong>🏆 Top {TOP_TODOS_LIMIT} by number:</strong>
      {todos.length === 0 ? (
        <p style={{ color: "#666" }}>No todos yet</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {todos.map((todo, index) => (
            <div
              key={todo.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "4px",
                padding: "8px",
                fontSize: "14px",
                backgroundColor: "#f0f8ff",
              }}
            >
              #{index + 1} {todo.name} ({todo.number})
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AppBenefits() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <div
      style={{
        marginTop: "20px",
        fontSize: "12px",
        color: "#666",
        border: "1px solid #eee",
        padding: "10px",
        borderRadius: "4px",
      }}
    >
      <strong>✨ Benefits:</strong>
      <br />• PGlite + Drizzle: Type-safe offline PostgreSQL database
      <br />• TanStack Query: Optimistic updates, caching, background refetch
      <br />• Cloud Sync: Push local data to Supabase PostgreSQL{" "}
      {isOnline ? "🌐" : "📴 (offline)"}
      <br />• Data persists across browser sessions in IndexedDB
      <br />• Same schema for local and cloud databases
      <br />• <strong>True offline-first!</strong> No internet required to start
      or use
      <br />• Auto-sync when online, manual sync available
      <br />•{" "}
      {!isOnline
        ? "🚫 Currently offline - but fully functional!"
        : "🌐 Online - sync available!"}
    </div>
  );
}

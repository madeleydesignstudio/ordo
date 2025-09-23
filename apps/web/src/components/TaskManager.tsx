import { usePGlite } from "@electric-sql/pglite-react";
import { eq, testElectricSync, testSyncConnectivity } from "@ordo/local-db";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useAutoSync } from "../hooks/useAutoSync";
import { useDatabase, type Task } from "../hooks/useDatabase";
import { useElectricSync } from "../hooks/useElectricSync";
import { ElectricSyncStatus } from "./ElectricSyncStatus";
import { LoadingFallback } from "./LoadingFallback";

export function TaskManager() {
  const {
    db,
    isInitialized,
    isLoading,
    error,
    tasks,
    clearDatabase,
    resetDatabase,
  } = useDatabase();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [syncTestResult, setSyncTestResult] = useState<any>(null);
  const pgliteClient = usePGlite();
  const queryClient = useQueryClient();

  // Auto-sync hook for automatic cloud synchronization
  const { autoSyncTask, autoDeleteTask } = useAutoSync({
    enabled: navigator.onLine, // Only enable when online
  });

  // Get ElectricSQL configuration
  const electricConfig = {
    electricUrl: import.meta.env.VITE_ELECTRIC_URL || "https://api.electric-sql.cloud",
    sourceId: import.meta.env.VITE_ELECTRIC_SOURCE_ID || "",
    secret: import.meta.env.VITE_ELECTRIC_SECRET || "",
    debug: import.meta.env.DEV === true,
    conflictResolution: 'latest-wins' as const,
    syncInterval: 5000,
    enableRealTimeSync: true,
  };

  const syncEnabled = import.meta.env.VITE_ELECTRIC_SYNC_ENABLED === "true";
  const isElectricConfigured = electricConfig.sourceId && electricConfig.secret;

  // Use basic ElectricSQL sync for reading from cloud
  const {
    isInitialized: isElectricSyncReady,
    isLoading: isElectricSyncing,
    isUpToDate,
    error: electricSyncError,
    canSync: canUseElectric,
    restartSync,
    clearError: clearElectricError,
  } = useElectricSync({
    config: isElectricConfigured ? electricConfig : undefined,
    autoStart: Boolean(syncEnabled && isElectricConfigured),
  });

  // Use TanStack Query to fetch tasks - simple and effective
  const { data: allTasks = [], refetch: refetchTasks } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: async (): Promise<Task[]> => {
      if (!isInitialized || !db) return [];
      const tasksData = await db.select().from(tasks);
      console.log(`[TaskManager] TanStack Query fetched ${tasksData.length} tasks`);
      return tasksData;
    },
    enabled: isInitialized && !!db,
    staleTime: 1000, // Consider data fresh for 1 second
    refetchInterval: isElectricSyncReady ? 3000 : false, // Refetch every 3s when sync is active for near real-time updates
    refetchOnWindowFocus: true, // Refetch when user switches back to tab
    refetchOnReconnect: true, // Refetch when internet reconnects
  });


  // Test Electric sync connectivity
  const handleTestSync = async () => {
    if (!isElectricConfigured) {
      alert("Electric sync is not configured. Please set VITE_ELECTRIC_SOURCE_ID and VITE_ELECTRIC_SECRET environment variables.");
      return;
    }

    try {
      console.log("Testing Electric sync...");
      const result = await testElectricSync(electricConfig);
      setSyncTestResult(result);
      console.log("Sync test result:", result);
      alert(`Sync test completed! Found ${result.taskCount} tasks in cloud database.`);
    } catch (error) {
      console.error("Sync test failed:", error);
      setSyncTestResult({ error: error instanceof Error ? error.message : String(error) });
      alert(`Sync test failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Test connectivity only
  const handleTestConnectivity = async () => {
    if (!isElectricConfigured) {
      alert("Electric sync is not configured. Please set VITE_ELECTRIC_SOURCE_ID and VITE_ELECTRIC_SECRET environment variables.");
      return;
    }

    try {
      console.log("Testing connectivity...");
      const isConnected = await testSyncConnectivity(electricConfig);
      alert(`Connectivity test: ${isConnected ? 'SUCCESS' : 'FAILED'}`);
    } catch (error) {
      console.error("Connectivity test failed:", error);
      alert(`Connectivity test failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const buttonStyle = {
    padding: "10px 20px",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginRight: "10px",
  };


  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "red" }}>
        <h1>❌ Database Error</h1>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{ ...buttonStyle, backgroundColor: "#007cba" }}
        >
          Reload Page
        </button>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingFallback message="Initializing database..." />;
  }

  if (!isInitialized) {
    return (
      <LoadingFallback message="Database not initialized. Please refresh the page." />
    );
  }

  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || !db) return;

    try {
      const newTask = {
        id: Date.now().toString(),
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim() || null,
        completed: false,
        created_at: new Date(),
        updated_at: new Date(),
      };

      console.log("[TaskManager] Adding new task:", newTask);
      await db.insert(tasks).values(newTask);

      // Clear form
      setNewTaskTitle("");
      setNewTaskDescription("");

      // Force refetch
      refetchTasks();

      // Auto-sync to cloud if enabled
      if (navigator.onLine) {
        await autoSyncTask(newTask);
      }

      console.log("[TaskManager] Task added successfully");
    } catch (error) {
      console.error("[TaskManager] Failed to add task:", error);
      alert(
        `Failed to add task: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  };

  const handleToggleTask = async (taskId: string) => {
    if (!db) return;

    try {
      const task = allTasks.find((t) => t.id === taskId);
      if (!task) return;

      const updatedTask = {
        ...task,
        completed: !task.completed,
        updated_at: new Date(),
      };

      console.log(
        `[TaskManager] Toggling task ${taskId}: ${task.completed} -> ${updatedTask.completed}`,
      );
      await db
        .update(tasks)
        .set(updatedTask)
        .where(eq(tasks.id, taskId));

      // Force refetch
      refetchTasks();

      // Auto-sync to cloud if enabled
      if (navigator.onLine) {
        await autoSyncTask(updatedTask);
      }

      console.log("[TaskManager] Task toggled successfully");
    } catch (error) {
      console.error("[TaskManager] Failed to toggle task:", error);
      alert(
        `Failed to toggle task: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!db) return;

    try {
      console.log(`[TaskManager] Deleting task ${taskId}`);
      await db.delete(tasks).where(eq(tasks.id, taskId));

      // Force refetch
      refetchTasks();

      // Auto-delete from cloud if enabled
      if (navigator.onLine) {
        await autoDeleteTask(taskId);
      }

      console.log("[TaskManager] Task deleted successfully");
    } catch (error) {
      console.error("[TaskManager] Failed to delete task:", error);
      alert(
        `Failed to delete task: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  };

  const handleClearAllTasks = async () => {
    if (!confirm("Are you sure you want to delete all tasks?")) return;
    if (!db) return;

    try {
      console.log("[TaskManager] Clearing all tasks");
      await db.delete(tasks);

      // Force refetch
      refetchTasks();

      console.log("[TaskManager] All tasks cleared successfully");
    } catch (error) {
      console.error("[TaskManager] Failed to clear tasks:", error);
      alert(
        `Failed to clear tasks: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>📋 Task Manager</h1>

      {/* ElectricSQL Status */}
      <ElectricSyncStatus
        isEnabled={syncEnabled}
        isConfigured={isElectricConfigured}
        isReady={isElectricSyncReady}
        isLoading={isElectricSyncing}
        isUpToDate={isUpToDate}
        error={electricSyncError}
        canSync={canUseElectric}
        onRestartSync={restartSync}
        onClearError={clearElectricError}
        onTestSync={handleTestSync}
        onTestConnectivity={handleTestConnectivity}
        taskCount={allTasks.length}
        syncTestResult={syncTestResult}
      />

      {/* Task input form */}
      <div
        style={{
          margin: "20px 0",
          padding: "20px",
          border: "1px solid #ccc",
          borderRadius: "8px",
        }}
      >
        <h3>Add New Task</h3>
        <input
          type="text"
          placeholder="Task title"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
        <textarea
          placeholder="Task description (optional)"
          value={newTaskDescription}
          onChange={(e) => setNewTaskDescription(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            resize: "vertical",
            minHeight: "60px",
          }}
        />
        <button
          onClick={handleAddTask}
          disabled={!newTaskTitle.trim()}
          style={{
            ...buttonStyle,
            backgroundColor: newTaskTitle.trim() ? "#4CAF50" : "#cccccc",
          }}
        >
          Add Task
        </button>
      </div>

      {/* Task list */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h3>
            Tasks ({allTasks.length}) - Completed:{" "}
            {allTasks.filter((t) => t.completed).length}
          </h3>
          <div>
            <button
              onClick={handleClearAllTasks}
              disabled={allTasks.length === 0}
              style={{
                ...buttonStyle,
                backgroundColor: allTasks.length > 0 ? "#f44336" : "#cccccc",
              }}
            >
              Clear All
            </button>
            <button
              onClick={clearDatabase}
              style={{ ...buttonStyle, backgroundColor: "#ff9800" }}
            >
              Clear Database
            </button>
            <button
              onClick={resetDatabase}
              style={{ ...buttonStyle, backgroundColor: "#9c27b0" }}
            >
              Reset Database
            </button>
          </div>
        </div>

        {allTasks.length === 0 ? (
          <p style={{ color: "#666", fontStyle: "italic" }}>
            No tasks yet. Add your first task above!
          </p>
        ) : (
          <div>
            {allTasks.map((task) => (
              <div
                key={task.id}
                style={{
                  padding: "15px",
                  margin: "10px 0",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  backgroundColor: task.completed ? "#f0f8ff" : "#ffffff",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ flex: 1 }}>
                  <h4
                    style={{
                      margin: "0 0 8px 0",
                      textDecoration: task.completed ? "line-through" : "none",
                      color: task.completed ? "#666" : "#000",
                    }}
                  >
                    {task.title}
                  </h4>
                  {task.description && (
                    <p
                      style={{
                        margin: "0 0 8px 0",
                        color: "#666",
                        fontSize: "14px",
                      }}
                    >
                      {task.description}
                    </p>
                  )}
                  <small style={{ color: "#999" }}>
                    Created: {new Date(task.created_at).toLocaleString()}
                    {task.updated_at &&
                      task.updated_at !== task.created_at && (
                        <>
                          {" "}
                          | Updated:{" "}
                          {new Date(task.updated_at).toLocaleString()}
                        </>
                      )}
                  </small>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginLeft: "15px",
                    flexShrink: 0,
                  }}
                >
                  <button
                    onClick={() => handleToggleTask(task.id)}
                    style={{
                      ...buttonStyle,
                      backgroundColor: task.completed ? "#ff9800" : "#4CAF50",
                      marginRight: "0",
                    }}
                  >
                    {task.completed ? "Undo" : "Complete"}
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    style={{
                      ...buttonStyle,
                      backgroundColor: "#f44336",
                      marginRight: "0",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

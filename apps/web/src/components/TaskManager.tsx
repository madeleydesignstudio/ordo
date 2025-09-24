import {
  eq,
  type Task,
  tasks,
  testElectricCloudSetup,
  testElectricSync,
  testSyncConnectivity,
} from "@ordo/local-db";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useDatabase } from "../hooks/useDatabase";
import { useElectricSyncEngine } from "../hooks/useElectricSyncEngine";
import { ElectricSyncStatus } from "./ElectricSyncStatus";
import { LoadingFallback } from "./LoadingFallback";

export function TaskManager() {
  const { db, isInitialized, isLoading, error, clearDatabase, resetDatabase } = useDatabase();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [syncTestResult, setSyncTestResult] = useState<any>(null);
  const queryClient = useQueryClient();

  // Auto-sync hook for local-to-cloud synchronization via engine (legacy - now handled by sync engine)
  // const { autoSyncTask, autoDeleteTask } = useAutoSync({
  //   enabled: navigator.onLine, // Only enable when online
  // });

  // Get ElectricSQL configuration
  const electricConfig = {
    electricUrl: import.meta.env.VITE_ELECTRIC_URL || "https://api.electric-sql.cloud",
    sourceId: import.meta.env.VITE_ELECTRIC_SOURCE_ID || "",
    secret: import.meta.env.VITE_ELECTRIC_SECRET || "",
    debug: import.meta.env.DEV === true,
    conflictResolution: "latest-wins" as const,
    syncInterval: 5000,
    enableRealTimeSync: true,
  };

  const syncEnabled = import.meta.env.VITE_ELECTRIC_SYNC_ENABLED === "true";
  const isElectricConfigured = electricConfig.sourceId && electricConfig.secret;

  // ElectricSQL Sync Engine: Bidirectional sync based on Linear Lite example
  const {
    isInitialized: isElectricSyncReady,
    isSyncing,
    syncStatus,
    syncMessage,
    error: electricSyncError,
    canSync: canUseElectric,
    startSyncEngine,
    stopSyncEngine,
    restartSyncEngine,
    clearError: clearElectricError,
  } = useElectricSyncEngine({
    autoStart: Boolean(syncEnabled && isElectricConfigured),
    onDataChange: () => {
      console.log(
        "[TaskManager] ElectricSQL sync engine detected data change, invalidating TanStack Query cache"
      );
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  // TanStack Query: Reads from local PGlite database
  //
  // Sync Architecture:
  // 1. ElectricSQL Sync Engine: Bidirectional sync (based on Linear Lite example)
  // 2. TanStack Query: PGlite → React UI (cached queries)
  const { data: allTasks = [], refetch: refetchTasks } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: async (): Promise<Task[]> => {
      if (!isInitialized || !db) return [];
      // Filter out deleted tasks from the UI
      const tasksData = await db.select().from(tasks).where(eq(tasks.deleted, false));
      console.log(
        `[TaskManager] TanStack Query fetched ${tasksData.length} non-deleted tasks from local PGlite`
      );
      return tasksData;
    },
    enabled: isInitialized && !!db,
    staleTime: Infinity, // Never consider data stale - ElectricSQL callbacks handle invalidation
    refetchOnWindowFocus: true, // Refetch when user switches back to tab
    refetchOnReconnect: true, // Refetch when internet reconnects
    // No refetchInterval - ElectricSQL sync engine automatically handles sync
  });

  // Test ElectricSQL Cloud setup
  const handleTestElectricCloud = async () => {
    if (!isElectricConfigured) {
      alert(
        "ElectricSQL is not configured. Please set VITE_ELECTRIC_SOURCE_ID and VITE_ELECTRIC_SECRET environment variables."
      );
      return;
    }

    try {
      console.log("Testing ElectricSQL Cloud setup...");
      const result = await testElectricCloudSetup(electricConfig);

      setSyncTestResult(result);
      console.log("ElectricSQL Cloud test result:", result);

      if (result.connected) {
        if (result.hasData) {
          alert(
            `✅ ElectricSQL Cloud connected successfully!\nFound ${result.details?.dataMessages || 0} data records in cloud database.`
          );
        } else {
          alert(
            `✅ ElectricSQL Cloud connected, but no tasks found in cloud database.\nThis is normal if you haven't created any tasks yet.`
          );
        }
      } else {
        alert(`❌ ElectricSQL Cloud connection failed:\n${result.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("ElectricSQL Cloud test failed:", error);
      setSyncTestResult({ error: error instanceof Error ? error.message : String(error) });
      alert(
        `ElectricSQL Cloud test failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  };

  // Test Electric sync connectivity
  const handleTestSync = async () => {
    if (!isElectricConfigured) {
      alert(
        "Electric sync is not configured. Please set VITE_ELECTRIC_SOURCE_ID and VITE_ELECTRIC_SECRET environment variables."
      );
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
      alert(
        "Electric sync is not configured. Please set VITE_ELECTRIC_SOURCE_ID and VITE_ELECTRIC_SECRET environment variables."
      );
      return;
    }

    try {
      console.log("Testing connectivity...");
      const isConnected = await testSyncConnectivity(electricConfig);
      alert(`Connectivity test: ${isConnected ? "SUCCESS" : "FAILED"}`);
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
    return <LoadingFallback message="Database not initialized. Please refresh the page." />;
  }

  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || !db) return;

    try {
      // Create task object that matches the database schema with sync columns
      const taskData = {
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim() || null,
        completed: false,
        // Sync tracking columns for Electric SQL
        synced: false,
        sentToServer: false,
        modifiedColumns: "title,description,completed",
        deleted: false,
        new: true,
        username: "local_user", // TODO: Replace with actual user when auth is implemented
        // Don't include createdAt, updatedAt, dueDate - let the database set defaults
        // The schema has defaultNow() for these fields
      };

      console.log("[TaskManager] Adding new task:", taskData);
      const result = await db.insert(tasks).values(taskData).returning();

      console.log("[TaskManager] Task inserted:", result);

      // Clear form
      setNewTaskTitle("");
      setNewTaskDescription("");

      // Update UI immediately
      refetchTasks();

      // The Electric SQL sync engine will automatically pick up this change
      // via the live query watching for synced=false tasks

      console.log("[TaskManager] Task added successfully");
    } catch (error) {
      console.error("[TaskManager] Failed to add task:", error);
      alert(`Failed to add task: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    if (!db) return;

    try {
      const task = allTasks.find((t) => t.id === taskId);
      if (!task) return;

      const updatedTask = {
        completed: !task.completed,
        updatedAt: new Date(),
        // Sync tracking columns for Electric SQL
        synced: false,
        sentToServer: false,
        modifiedColumns: "completed",
        new: false, // This is an update, not a new task
        username: "local_user", // TODO: Replace with actual user when auth is implemented
      };

      console.log(
        `[TaskManager] Toggling task ${taskId}: ${task.completed} -> ${updatedTask.completed}`
      );
      await db.update(tasks).set(updatedTask).where(eq(tasks.id, taskId));

      // Update UI immediately
      refetchTasks();

      // The Electric SQL sync engine will automatically pick up this change
      // via the live query watching for synced=false tasks

      console.log("[TaskManager] Task toggled successfully");
    } catch (error) {
      console.error("[TaskManager] Failed to toggle task:", error);
      alert(`Failed to toggle task: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!db) return;

    try {
      console.log(`[TaskManager] Marking task ${taskId} as deleted`);

      // Instead of hard deleting, mark as deleted for sync
      const deletedTask = {
        deleted: true,
        synced: false,
        sentToServer: false,
        modifiedColumns: "deleted",
        updatedAt: new Date(),
        username: "local_user", // TODO: Replace with actual user when auth is implemented
      };

      await db.update(tasks).set(deletedTask).where(eq(tasks.id, taskId));

      // Update UI immediately
      refetchTasks();

      // The Electric SQL sync engine will automatically pick up this change
      // via the live query watching for synced=false tasks

      console.log("[TaskManager] Task marked as deleted successfully");
    } catch (error) {
      console.error("[TaskManager] Failed to delete task:", error);
      alert(`Failed to delete task: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleClearAllTasks = async () => {
    if (!confirm("Are you sure you want to delete all tasks?")) return;
    if (!db) return;

    try {
      console.log("[TaskManager] Clearing all tasks");
      await db.delete(tasks);

      // Update UI immediately
      refetchTasks();

      // Note: Bulk deletions not yet implemented in Engine API
      // Individual task deletions would happen via autoDeleteTask

      console.log("[TaskManager] All tasks cleared successfully");
    } catch (error) {
      console.error("[TaskManager] Failed to clear tasks:", error);
      alert(`Failed to clear tasks: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>📋 Task Manager</h1>

      {/* ElectricSQL Status */}
      <ElectricSyncStatus />

      {/* Electric Sync Engine Status */}
      <div
        style={{ margin: "20px 0", padding: "15px", border: "1px solid #ddd", borderRadius: "8px" }}
      >
        <h4>🔄 Electric Sync Engine</h4>
        <p style={{ margin: "5px 0", fontSize: "14px", color: "#666" }}>
          Status: {syncStatus} |{syncMessage && ` Message: ${syncMessage} |`}
          Ready: {isElectricSyncReady ? "✅" : "❌"} | Syncing: {isSyncing ? "✅" : "❌"} | Config:{" "}
          {isElectricConfigured ? "✅" : "❌"} | Tasks: {allTasks.length}
        </p>
        {electricSyncError && (
          <p style={{ margin: "5px 0", fontSize: "12px", color: "red" }}>
            Error: {electricSyncError}
          </p>
        )}
        <div>
          <button
            onClick={startSyncEngine}
            disabled={!canUseElectric || isElectricSyncReady}
            style={{
              ...buttonStyle,
              backgroundColor: !canUseElectric || isElectricSyncReady ? "#cccccc" : "#4CAF50",
            }}
          >
            Start Sync Engine
          </button>
          <button
            onClick={stopSyncEngine}
            disabled={!isElectricSyncReady}
            style={{
              ...buttonStyle,
              backgroundColor: !isElectricSyncReady ? "#cccccc" : "#f44336",
            }}
          >
            Stop Sync Engine
          </button>
          <button
            onClick={restartSyncEngine}
            disabled={!canUseElectric}
            style={{
              ...buttonStyle,
              backgroundColor: !canUseElectric ? "#cccccc" : "#FF9800",
            }}
          >
            Restart Sync Engine
          </button>
          <button
            onClick={handleTestConnectivity}
            disabled={!isElectricConfigured}
            style={{
              ...buttonStyle,
              backgroundColor: isElectricConfigured ? "#2196F3" : "#cccccc",
            }}
          >
            Test Connectivity
          </button>
          <button
            onClick={handleTestSync}
            disabled={!isElectricConfigured}
            style={{
              ...buttonStyle,
              backgroundColor: isElectricConfigured ? "#4CAF50" : "#cccccc",
            }}
          >
            Test Full Sync
          </button>
          <button
            onClick={handleTestElectricCloud}
            disabled={!isElectricConfigured}
            style={{
              ...buttonStyle,
              backgroundColor: isElectricConfigured ? "#9C27B0" : "#cccccc",
            }}
          >
            Test Cloud Setup
          </button>
          <button
            onClick={restartSyncEngine}
            disabled={!canUseElectric}
            style={{
              ...buttonStyle,
              backgroundColor: canUseElectric ? "#FF9800" : "#cccccc",
            }}
          >
            Restart Sync
          </button>
          {electricSyncError && (
            <button
              onClick={clearElectricError}
              style={{
                ...buttonStyle,
                backgroundColor: "#f44336",
              }}
            >
              Clear Error
            </button>
          )}
        </div>
        {electricSyncError && (
          <p style={{ color: "red", fontSize: "14px", margin: "10px 0 0 0" }}>
            ❌ {electricSyncError}
          </p>
        )}
        {syncTestResult && (
          <pre
            style={{
              fontSize: "12px",
              background: "#f5f5f5",
              padding: "10px",
              margin: "10px 0",
              overflow: "auto",
            }}
          >
            {JSON.stringify(syncTestResult, null, 2)}
          </pre>
        )}
      </div>

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
            Tasks ({allTasks.length}) - Completed: {allTasks.filter((t) => t.completed).length}
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
            <button onClick={clearDatabase} style={{ ...buttonStyle, backgroundColor: "#ff9800" }}>
              Clear Database
            </button>
            <button onClick={resetDatabase} style={{ ...buttonStyle, backgroundColor: "#9c27b0" }}>
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
                    Created: {new Date(task.createdAt).toLocaleString()}
                    {task.updatedAt && task.updatedAt !== task.createdAt && (
                      <> | Updated: {new Date(task.updatedAt).toLocaleString()}</>
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

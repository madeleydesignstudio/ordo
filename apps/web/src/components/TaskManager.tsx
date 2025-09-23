import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDatabase, type Task } from "../hooks/useDatabase";
import { useAutoSync } from "../hooks/useAutoSync";
import { LoadingFallback } from "./LoadingFallback";
import { ElectricSyncStatus } from "./ElectricSyncStatus";
import { useElectricSync } from "../hooks/useElectricSync";
import { eq, testElectricSync, testSyncConnectivity } from "@ordo/local-db";
import { usePGlite } from "@electric-sql/pglite-react";

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
    staleTime: 5000, // Consider data fresh for 5 seconds
    refetchInterval: isElectricSyncReady ? 30000 : false, // Refetch every 30s when sync is active
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
        <button
          onClick={() => {
            if ("indexedDB" in window) indexedDB.deleteDatabase("ordo-db");
            window.location.reload();
          }}
          style={{
            ...buttonStyle,
            backgroundColor: "#dc3545",
            marginRight: "0",
          }}
        >
          Reset Database & Reload
        </button>
      </div>
    );
  }

  if (isLoading)
    return <LoadingFallback message="🔄 Initializing database..." />;
  if (!isInitialized || !db)
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "orange" }}>
        ⚠️ Database not ready. Please refresh the page.
      </div>
    );

  // Add new task
  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTaskTitle.trim() || !db) return;

    try {
      const newTask = await db
        .insert(tasks)
        .values({
          title: newTaskTitle.trim(),
          description: newTaskDescription.trim() || null,
        })
        .returning();

      if (newTask[0]) {
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        setNewTaskTitle("");
        setNewTaskDescription("");
        
        // Auto-sync to cloud (silent)
        autoSyncTask(newTask[0]);
      }
    } catch (err) {
      console.error("Failed to add task:", err);
      alert("Failed to add task. Please try again.");
    }
  }

  // Toggle task completion
  async function toggleTask(taskId: string, completed: boolean) {
    if (!db) return;

    try {
      const updatedTask = await db
        .update(tasks)
        .set({ completed: !completed })
        .where(eq(tasks.id, taskId))
        .returning();

      if (updatedTask[0]) {
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        
        // Auto-sync update to cloud (silent)
        autoSyncTask(updatedTask[0]);
      }
    } catch (err) {
      console.error("Failed to toggle task:", err);
      alert("Failed to update task. Please try again.");
    }
  }

  // Delete task
  async function deleteTask(taskId: string) {
    if (!db) return;

    try {
      await db.delete(tasks).where(eq(tasks.id, taskId));
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      
      // Auto-sync deletion to cloud (silent)
      autoDeleteTask(taskId);
    } catch (err) {
      console.error("Failed to delete task:", err);
      alert("Failed to delete task. Please try again.");
    }
  }

  async function handleResetDatabase() {
    if (
      !confirm(
        "Are you sure you want to reset the database? This will delete all data!",
      )
    )
      return;
    try {
      await resetDatabase();
      window.location.reload();
    } catch (err) {
      console.error("Failed to reset database:", err);
      alert("Failed to reset database. Check console for details.");
    }
  }

  async function handleClearData() {
    if (!confirm("Are you sure you want to clear all data?")) return;
    try {
      await clearDatabase();
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    } catch (err) {
      console.error("Failed to clear data:", err);
      alert("Failed to clear data. Check console for details.");
    }
  }

  // Debug function to check database state
  const debugDatabaseState = async () => {
    if (!db || !pgliteClient) {
      console.log("[Debug] Database not ready");
      return;
    }

    try {
      console.log("[Debug] === Database State Debug ===");

      // Check PGlite electric extension
      console.log("[Debug] PGlite has electric extension:", !!pgliteClient.electric);

      // Raw SQL query to check tasks table
      try {
        const rawResult = await pgliteClient.query('SELECT * FROM tasks ORDER BY created_at DESC');
        console.log(`[Debug] Raw SQL query found ${rawResult.rows.length} tasks:`, rawResult.rows);
      } catch (err) {
        console.log("[Debug] Raw SQL query failed:", err instanceof Error ? err.message : String(err));
      }

      // Drizzle ORM query
      const countResult = await db.select().from(tasks);
      console.log(`[Debug] Drizzle ORM query found ${countResult.length} tasks`);

      // Show all tasks with details
      countResult.forEach((task: Task, index: number) => {
        console.log(`[Debug] Task ${index + 1}:`, {
          id: task.id,
          title: task.title,
          completed: task.completed,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          description: task.description,
          dueDate: task.dueDate
        });
      });

      // Check React state vs database
      console.log(`[Debug] React state has ${allTasks.length} tasks`);
      console.log(`[Debug] Database has ${countResult.length} tasks`);
      console.log(`[Debug] State/DB mismatch: ${allTasks.length !== countResult.length ? 'YES' : 'NO'}`);

      // Check electric metadata and sync status
      if (pgliteClient.electric) {
        try {
          // Check electric tables
          const metadataResult = await pgliteClient.query(`
            SELECT schemaname, tablename
            FROM pg_tables
            WHERE schemaname = 'electric' OR tablename LIKE '%electric%'
          `);
          console.log("[Debug] Electric metadata tables:", metadataResult.rows);

          // Check sync status
          console.log("[Debug] ElectricSQL sync status:", {
            isElectricSyncReady,
            isElectricSyncing,
            isUpToDate,
            electricSyncError,
            canUseElectric
          });

        } catch (err) {
          console.log("[Debug] Could not query electric metadata:", err instanceof Error ? err.message : String(err));
        }
      }

      console.log("[Debug] Database debugging complete");
    } catch (error) {
      console.error("[Debug] Error during database debug:", error);
    }
  };

  // Reset database to fix primary key conflicts
  const resetDatabaseForSync = async () => {
    if (!confirm("⚠️ This will clear your local database and re-sync from cloud. Continue?")) {
      return;
    }

    try {
      console.log("[Reset] Clearing local database for clean ElectricSQL sync...");

      // Clear all local tasks
      await clearDatabase();

      // Clear browser storage to reset ElectricSQL sync state
      localStorage.removeItem('electric-sync-state');

      // Also clear any ElectricSQL metadata
      if (pgliteClient.electric) {
        try {
          await pgliteClient.query('DROP SCHEMA IF EXISTS electric CASCADE');
        } catch (err) {
          console.log("[Reset] No electric schema to drop");
        }
      }

      console.log("[Reset] ✅ Local database cleared. Refreshing page for clean sync...");

      // Refresh page to restart ElectricSQL sync
      window.location.reload();
    } catch (error) {
      console.error("[Reset] ❌ Failed to reset database:", error);
      alert("Failed to reset database. Check console for details.");
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <header style={{ marginBottom: "30px", textAlign: "center" }}>
        <h1>📋 Simple Task Manager</h1>
        <p>Powered by Drizzle ORM + PGlite</p>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 12px",
            backgroundColor: "#e8f5e8",
            border: "1px solid #4caf50",
            borderRadius: "4px",
            fontSize: "12px",
            color: "#2e7d32",
            marginTop: "10px",
          }}
        >
          <span>💾</span>
          <span>Data persisted in browser storage</span>
        </div>
      </header>

      {/* Add New Task */}
      <section
        style={{
          marginBottom: "30px",
          padding: "20px",
          border: "1px solid #e0e0e0",
          borderRadius: "8px",
        }}
      >
        <h2>➕ Add New Task</h2>
        <form onSubmit={addTask}>
          <div style={{ marginBottom: "10px" }}>
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Task title"
              style={{
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                width: "100%",
              }}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <textarea
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              placeholder="Task description (optional)"
              rows={3}
              style={{
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                width: "100%",
                resize: "vertical",
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              ...buttonStyle,
              backgroundColor: "#2196F3",
              padding: "8px 16px",
            }}
          >
            Add Task
          </button>
        </form>
      </section>


      {/* ElectricSQL Sync Status */}
      <section
        style={{
          marginBottom: "20px",
          padding: "20px",
          border: "1px solid #e0e0e0",
          borderRadius: "8px",
        }}
      >
        <div style={{ marginBottom: "20px" }}>
          <h3>🔄 ElectricSQL Sync (Read-Only from Cloud)</h3>

          {syncEnabled && isElectricConfigured ? (
            <div style={{ marginBottom: "15px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <span style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: isElectricSyncReady ? "#28a745" : isElectricSyncing ? "#007bff" : electricSyncError ? "#dc3545" : "#6c757d",
                  display: "inline-block",
                }}></span>
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  {isElectricSyncReady ? "ElectricSQL Sync Active" :
                   isElectricSyncing ? "Initializing Sync..." :
                   electricSyncError ? "Sync Error" :
                   !canUseElectric ? "Sync Unavailable" :
                   "Sync Stopped"}
                </span>
                <span style={{ fontSize: "12px", color: "#666" }}>
                  (Up-to-date: {isUpToDate ? "Yes" : "No"})
                </span>
              </div>

              {electricSyncError && (
                <div style={{ fontSize: "12px", color: "#dc3545", marginBottom: "8px" }}>
                  Error: {electricSyncError}
                </div>
              )}

              <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "10px" }}>
                {canUseElectric && (
                  <button
                    onClick={restartSync}
                    disabled={isElectricSyncing}
                    style={{
                      padding: "4px 12px",
                      fontSize: "11px",
                      backgroundColor: "#007bff",
                      color: "white",
                      border: "none",
                      borderRadius: "3px",
                      cursor: isElectricSyncing ? "not-allowed" : "pointer",
                      opacity: isElectricSyncing ? 0.6 : 1,
                    }}
                    title="Restart sync from cloud"
                  >
                    🔄 Restart Sync
                  </button>
                )}

                {electricSyncError && (
                  <button
                    onClick={clearElectricError}
                    style={{
                      padding: "4px 8px",
                      fontSize: "11px",
                      backgroundColor: "#6c757d",
                      color: "white",
                      border: "none",
                      borderRadius: "3px",
                      cursor: "pointer",
                    }}
                  >
                    Clear Error
                  </button>
                )}
              </div>

              <ElectricSyncStatus />
              
              <div style={{ marginTop: "10px" }}>
                <button
                  onClick={handleTestConnectivity}
                  style={{ ...buttonStyle, background: "#17a2b8", marginRight: "10px" }}
                >
                  🔗 Test Connectivity
                </button>
                <button
                  onClick={handleTestSync}
                  style={{ ...buttonStyle, background: "#6f42c1" }}
                >
                  🧪 Test Full Sync
                </button>
              </div>
              
              {syncTestResult && (
                <div style={{ 
                  marginTop: "10px", 
                  padding: "10px", 
                  background: syncTestResult.error ? "#f8d7da" : "#d4edda", 
                  border: `1px solid ${syncTestResult.error ? "#f5c6cb" : "#c3e6cb"}`, 
                  borderRadius: "4px" 
                }}>
                  {syncTestResult.error ? (
                    <p>❌ <strong>Sync Test Failed:</strong> {syncTestResult.error}</p>
                  ) : (
                    <div>
                      <p>✅ <strong>Sync Test Passed!</strong></p>
                      <ul>
                        <li>Connected: {syncTestResult.connected ? '✅' : '❌'}</li>
                        <li>Sync Setup: {syncTestResult.syncSetup ? '✅' : '❌'}</li>
                        <li>Tasks Found: {syncTestResult.taskCount}</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: "10px", background: "#f8f9fa", border: "1px solid #dee2e6", borderRadius: "4px", marginBottom: "15px" }}>
              <p>⚠️ ElectricSQL sync is not configured</p>
              <small style={{ color: "#6c757d" }}>Set VITE_ELECTRIC_SOURCE_ID and VITE_ELECTRIC_SECRET environment variables</small>
            </div>
          )}

          {/* Sync Status and Controls */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>

              <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => {
                  console.log("[TaskManager] Manual task refresh triggered");
                  refetchTasks();
                }}
                style={{
                  padding: "4px 8px",
                  fontSize: "11px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "3px",
                  cursor: "pointer",
                }}
                title="Refresh tasks from database"
              >
                🔄 Refresh Tasks
              </button>
              <button
                onClick={debugDatabaseState}
                style={{
                  padding: "4px 8px",
                  fontSize: "11px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "3px",
                  cursor: "pointer",
                }}
                title="Debug database state (check browser console)"
              >
                🐛 Debug DB
              </button>
              <button
                onClick={resetDatabaseForSync}
                style={{
                  padding: "4px 8px",
                  fontSize: "11px",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "3px",
                  cursor: "pointer",
                }}
                title="Clear local database and restart ElectricSQL sync"
              >
                🔄 Reset & Sync
              </button>
            </div>
          </div>

          {/* ElectricSQL Sync Info */}
          <div style={{
            marginTop: "10px",
            padding: "10px",
            backgroundColor: "#e8f4ff",
            border: "1px solid #007bff",
            borderRadius: "4px",
            fontSize: "12px",
          }}>
            <strong>⚡ ElectricSQL Read-Only Sync:</strong>
            <ul style={{ margin: "5px 0 0 20px", padding: 0 }}>
              <li>📥 Pulls latest data from cloud database</li>
              <li>🔄 Real-time updates when cloud data changes</li>
              <li>📝 Local writes handled by @ordo/engine service</li>
              <li>🚀 Fast local reads with cloud sync</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Task Statistics */}
      <section
        style={{
          marginBottom: "20px",
          display: "flex",
          gap: "15px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            padding: "15px",
            backgroundColor: "#e3f2fd",
            borderRadius: "8px",
            flex: "1",
            minWidth: "120px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#1976d2",
            }}
          >
            {allTasks.length}
          </div>
          <div style={{ fontSize: "14px", color: "#666" }}>Total Tasks</div>
        </div>
        <div
          style={{
            padding: "15px",
            backgroundColor: "#e8f5e8",
            borderRadius: "8px",
            flex: "1",
            minWidth: "120px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#4caf50",
            }}
          >
            {allTasks.filter((task) => task.completed).length}
          </div>
          <div style={{ fontSize: "14px", color: "#666" }}>Completed</div>
        </div>
        <div
          style={{
            padding: "15px",
            backgroundColor: "#fff3e0",
            borderRadius: "8px",
            flex: "1",
            minWidth: "120px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#ff9800",
            }}
          >
            {allTasks.filter((task) => !task.completed).length}
          </div>
          <div style={{ fontSize: "14px", color: "#666" }}>Pending</div>
        </div>
      </section>

      {/* Task List */}
      <section>
        <h2>📝 Your Tasks</h2>
        {allTasks.length === 0 ? (
          <p
            style={{
              textAlign: "center",
              color: "#666",
              fontStyle: "italic",
              padding: "20px",
            }}
          >
            No tasks yet. Add one above!
          </p>
        ) : (
          <div style={{ display: "grid", gap: "12px" }}>
            {allTasks.map((task) => (
              <div
                key={task.id}
                style={{
                  padding: "16px",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  backgroundColor: task.completed ? "#f8f9fa" : "white",
                  opacity: task.completed ? 0.8 : 1,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id, task.completed)}
                    style={{ marginTop: "2px", transform: "scale(1.2)" }}
                  />
                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        margin: "0 0 8px 0",
                        textDecoration: task.completed
                          ? "line-through"
                          : "none",
                        color: task.completed ? "#666" : "#333",
                      }}
                    >
                      {task.title}
                    </h3>
                    {task.description && (
                      <p
                        style={{
                          margin: "0 0 8px 0",
                          color: "#666",
                          fontSize: "14px",
                          textDecoration: task.completed
                            ? "line-through"
                            : "none",
                        }}
                      >
                        {task.description}
                      </p>
                    )}
                    <div style={{ fontSize: "12px", color: "#999" }}>
                      Created: {task.createdAt.toLocaleDateString()}
                      {task.dueDate && (
                        <> • Due: {task.dueDate.toLocaleDateString()}</>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteTask(task.id)}
                    style={{
                      ...buttonStyle,
                      backgroundColor: "#f44336",
                      padding: "6px 12px",
                      fontSize: "12px",
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
      </section>

      {/* Developer Tools */}
      <details
        style={{
          marginTop: "40px",
          padding: "20px",
          border: "1px solid #ffa726",
          borderRadius: "8px",
          backgroundColor: "#fff8e1",
        }}
      >
        <summary
          style={{
            cursor: "pointer",
            marginBottom: "15px",
            fontWeight: "bold",
            color: "#f57c00",
          }}
        >
          🔧 Developer Tools
        </summary>
        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            marginBottom: "15px",
          }}
        >
          <button
            onClick={handleClearData}
            style={{
              ...buttonStyle,
              backgroundColor: "#ff9800",
              padding: "8px 16px",
              fontSize: "12px",
            }}
          >
            Clear All Data
          </button>
          <button
            onClick={handleResetDatabase}
            style={{
              ...buttonStyle,
              backgroundColor: "#f44336",
              padding: "8px 16px",
              fontSize: "12px",
              marginRight: "0",
            }}
          >
            Reset Database & Reload
          </button>
        </div>
        <div style={{ fontSize: "12px", color: "#666" }}>
          <strong>Clear All Data:</strong> Removes all tasks but keeps the
          schema.
          <br />
          <strong>Reset Database:</strong> Drops and recreates the entire
          database, then reloads the page.
        </div>
      </details>

      <details style={{ marginTop: "20px", fontSize: "12px", color: "#666" }}>
        <summary style={{ cursor: "pointer", marginBottom: "10px" }}>
          Debug Info
        </summary>
        <pre
          style={{
            backgroundColor: "#f5f5f5",
            padding: "10px",
            borderRadius: "4px",
            overflow: "auto",
          }}
        >
          Tasks: {allTasks.length}
          {"\n"}Database Status: {isInitialized ? "Ready" : "Not Ready"}
          {"\n"}Storage: IndexedDB (idb://ordo-db){"\n"}Persistent: Yes - Data
          survives page refresh
        </pre>
      </details>
    </div>
  );
}

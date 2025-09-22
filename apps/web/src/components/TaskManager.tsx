import { useState, useEffect } from "react";
import { useDatabase, type Task } from "../hooks/useDatabase";
import { useSync } from "../hooks/useSync";
import { LoadingFallback } from "./LoadingFallback";
import { ElectricSyncStatus } from "./ElectricSyncStatus";
import { useBidirectionalSync } from "../hooks/useBidirectionalSync";
import { eq } from "@ordo/local-db";
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
  const {
    isLoading: isSyncing,
    status: syncStatus,
    message: syncMessage,
    error: syncError,
    lastSyncTime,
    syncToCloud,
    checkBackendStatus,
    clearSyncStatus,
  } = useSync();
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [backendAvailable, setBackendAvailable] = useState<boolean>(false);
  const [useBidirectional, setUseBidirectional] = useState<boolean>(true);
  const pgliteClient = usePGlite();

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

  // Use bidirectional sync if configured and enabled
  const {
    isInitialized: isBidirectionalSyncReady,
    isLoading: isBidirectionalSyncing,
    conflictCount,
    syncedRecords,
    failedRecords,
    error: bidirectionalSyncError,
    canSync: canUseBidirectional,
    forceSyncFromRemote,
    clearError: clearBidirectionalError,
  } = useBidirectionalSync({
    config: isElectricConfigured && useBidirectional ? electricConfig : undefined,
    autoStart: Boolean(syncEnabled && isElectricConfigured && useBidirectional),
  });

  // Fetch tasks
  useEffect(() => {
    if (!isInitialized) return;

    async function fetchData() {
      try {
        if (db) {
          const tasksData = await db.select().from(tasks);
          setAllTasks(tasksData);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    }

    fetchData();
  }, [isInitialized, db]);

  // Check backend availability on mount
  useEffect(() => {
    checkBackendStatus().then(setBackendAvailable);
  }, [checkBackendStatus]);

  const buttonStyle = {
    padding: "10px 20px",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginRight: "10px",
  };

  // Handle sync to cloud
  const handleSyncToCloud = async () => {
    try {
      const result = await syncToCloud(allTasks);
      if (result.success) {
        // Success feedback is handled by the hook
      } else {
        console.error("Sync failed:", result.message);
      }
    } catch (error) {
      console.error("Sync error:", error);
    }
  };

  // Check if we should show sync button
  const showSyncButton = navigator.onLine;

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
        setAllTasks((prev) => [...prev, newTask[0]]);
        setNewTaskTitle("");
        setNewTaskDescription("");
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
        setAllTasks((prev) =>
          prev.map((task) => (task.id === taskId ? updatedTask[0] : task)),
        );
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
      setAllTasks((prev) => prev.filter((task) => task.id !== taskId));
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
      setAllTasks([]);
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

      // Count total tasks
      const countResult = await db.select().from(tasks);
      console.log(`[Debug] Total tasks in local database: ${countResult.length}`);

      // Show all tasks with details
      countResult.forEach((task: Task, index: number) => {
        console.log(`[Debug] Task ${index + 1}:`, {
          id: task.id,
          title: task.title,
          completed: task.completed,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt
        });
      });

      // Check electric metadata if available
      if (pgliteClient.electric) {
        try {
          const metadataResult = await pgliteClient.query(`
            SELECT schemaname, tablename
            FROM pg_tables
            WHERE schemaname = 'electric' OR tablename LIKE '%electric%'
          `);
          console.log("[Debug] Electric metadata tables:", metadataResult.rows);
        } catch (err) {
          console.log("[Debug] Could not query electric metadata:", err instanceof Error ? err.message : String(err));
        }
      }

      // Check if there are any shape subscriptions
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

      {/* Sync Section */}
      {showSyncButton && (
        <section
          style={{
            marginBottom: "20px",
            padding: "20px",
            border: "1px solid #2196F3",
            borderRadius: "8px",
            backgroundColor: "#e3f2fd",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <div>
              <h3 style={{ margin: "0 0 5px 0", color: "#1976d2" }}>
                ☁️ Cloud Sync
              </h3>
              <p style={{ margin: "0", fontSize: "14px", color: "#666" }}>
                Sync your tasks to the cloud database
                {lastSyncTime && (
                  <span> • Last sync: {lastSyncTime.toLocaleString()}</span>
                )}
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {syncStatus === "success" && syncMessage && (
                <div
                  style={{
                    fontSize: "12px",
                    color: "#4caf50",
                    backgroundColor: "#e8f5e8",
                    padding: "6px 12px",
                    borderRadius: "4px",
                    border: "1px solid #4caf50",
                  }}
                >
                  ✅ {syncMessage}
                </div>
              )}
              {syncError && (
                <div
                  style={{
                    fontSize: "12px",
                    color: "#f44336",
                    backgroundColor: "#ffebee",
                    padding: "6px 12px",
                    borderRadius: "4px",
                    border: "1px solid #f44336",
                  }}
                >
                  ❌ {syncError}
                </div>
              )}
              <button
                onClick={handleSyncToCloud}
                disabled={isSyncing || allTasks.length === 0}
                style={{
                  ...buttonStyle,
                  backgroundColor: isSyncing ? "#ccc" : "#2196F3",
                  cursor:
                    isSyncing || allTasks.length === 0
                      ? "not-allowed"
                      : "pointer",
                  padding: "8px 16px",
                  fontSize: "14px",
                  marginRight: "0",
                }}
              >
                {isSyncing
                  ? "🔄 Syncing..."
                  : `📤 Sync ${allTasks.length} Tasks`}
              </button>
            </div>
          </div>
          {backendAvailable === false && (
            <div
              style={{
                marginTop: "10px",
                fontSize: "12px",
                color: "#ff9800",
                backgroundColor: "#fff8e1",
                padding: "8px 12px",
                borderRadius: "4px",
                border: "1px solid #ff9800",
              }}
            >
              ⚠️ Sync backend is not available. Make sure the sync server is
              running on port 3001.
            </div>
          )}
          {!navigator.onLine && (
            <div
              style={{
                marginTop: "10px",
                fontSize: "12px",
                color: "#f44336",
                backgroundColor: "#ffebee",
                padding: "8px 12px",
                borderRadius: "4px",
                border: "1px solid #f44336",
              }}
            >
              🌐 You're offline. Sync will be available when you're back online.
            </div>
          )}
          {(syncStatus === "success" || syncError) && (
            <button
              onClick={clearSyncStatus}
              style={{
                marginTop: "10px",
                padding: "4px 8px",
                fontSize: "11px",
                backgroundColor: "transparent",
                color: "#666",
                border: "1px solid #ccc",
                borderRadius: "3px",
                cursor: "pointer",
              }}
            >
              Clear Status
            </button>
          )}
        </section>
      )}

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
          {/* Sync Mode Toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px" }}>
            <span style={{ fontSize: "14px", fontWeight: "500" }}>Sync Mode:</span>
            <label style={{ display: "flex", alignItems: "center", gap: "5px", cursor: "pointer" }}>
              <input
                type="radio"
                name="syncMode"
                checked={!useBidirectional}
                onChange={() => setUseBidirectional(false)}
              />
              <span style={{ fontSize: "13px" }}>Basic ElectricSQL</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "5px", cursor: "pointer" }}>
              <input
                type="radio"
                name="syncMode"
                checked={useBidirectional}
                onChange={() => setUseBidirectional(true)}
              />
              <span style={{ fontSize: "13px", color: "#28a745", fontWeight: "500" }}>
                🚀 Smart Bidirectional Sync
              </span>
            </label>
          </div>

          {/* Sync Status and Controls */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            {useBidirectional ? (
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  <span style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: isBidirectionalSyncReady ? "#28a745" : isBidirectionalSyncing ? "#007bff" : bidirectionalSyncError ? "#dc3545" : "#6c757d",
                    display: "inline-block",
                  }}></span>
                  <span style={{ fontSize: "14px", fontWeight: "500" }}>
                    {isBidirectionalSyncReady ? "Smart Sync Active" :
                     isBidirectionalSyncing ? "Initializing Smart Sync..." :
                     bidirectionalSyncError ? "Smart Sync Error" :
                     !canUseBidirectional ? "Smart Sync Unavailable" :
                     "Smart Sync Stopped"}
                  </span>
                </div>

                {isBidirectionalSyncReady && (
                  <div style={{ fontSize: "12px", color: "#666", marginBottom: "8px" }}>
                    Synced: {syncedRecords} | Conflicts: {conflictCount} | Failed: {failedRecords}
                  </div>
                )}

                {bidirectionalSyncError && (
                  <div style={{ fontSize: "12px", color: "#dc3545", marginBottom: "8px" }}>
                    Error: {bidirectionalSyncError}
                  </div>
                )}

                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  {isBidirectionalSyncReady && (
                    <button
                      onClick={forceSyncFromRemote}
                      style={{
                        padding: "4px 12px",
                        fontSize: "11px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "3px",
                        cursor: "pointer",
                      }}
                      title="Force sync from cloud (preserves local data)"
                    >
                      🔄 Force Sync
                    </button>
                  )}

                  {bidirectionalSyncError && (
                    <button
                      onClick={clearBidirectionalError}
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
              </div>
            ) : (
              <ElectricSyncStatus />
            )}

            <div style={{ display: "flex", gap: "8px" }}>
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
              {!useBidirectional && (
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
              )}
            </div>
          </div>

          {/* Bidirectional Sync Info */}
          {useBidirectional && (
            <div style={{
              marginTop: "10px",
              padding: "10px",
              backgroundColor: "#e8f5e8",
              border: "1px solid #28a745",
              borderRadius: "4px",
              fontSize: "12px",
            }}>
              <strong>🚀 Smart Bidirectional Sync Enabled:</strong>
              <ul style={{ margin: "5px 0 0 20px", padding: 0 }}>
                <li>✅ Multi-device sync without conflicts</li>
                <li>✅ Preserves local data during sync</li>
                <li>✅ Auto-resolves conflicts with "latest wins"</li>
                <li>✅ Real-time updates from cloud</li>
              </ul>
            </div>
          )}
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

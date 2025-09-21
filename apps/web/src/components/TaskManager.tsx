import { useState, useEffect } from "react";
import { eq } from "drizzle-orm";
import { useDatabase, type Task } from "../hooks/useDatabase";
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
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");

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

  // Show error message if database failed to initialize
  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "red" }}>
        <h1>❌ Database Error</h1>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007cba",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginRight: "10px",
          }}
        >
          Reload Page
        </button>
        <button
          onClick={() => {
            if ("indexedDB" in window) {
              indexedDB.deleteDatabase("ordo-db");
            }
            window.location.reload();
          }}
          style={{
            padding: "10px 20px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Reset Database & Reload
        </button>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return <LoadingFallback message="🔄 Initializing database..." />;
  }

  // Show warning if database is not initialized
  if (!isInitialized || !db) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "orange" }}>
        <div>⚠️ Database not ready. Please refresh the page.</div>
      </div>
    );
  }

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

  // Reset database for development
  async function handleResetDatabase() {
    if (
      !confirm(
        "Are you sure you want to reset the database? This will delete all data!",
      )
    ) {
      return;
    }

    try {
      await resetDatabase();
      // Reload the page to reinitialize everything
      window.location.reload();
    } catch (err) {
      console.error("Failed to reset database:", err);
      alert("Failed to reset database. Check console for details.");
    }
  }

  // Clear all data
  async function handleClearData() {
    if (!confirm("Are you sure you want to clear all data?")) {
      return;
    }

    try {
      await clearDatabase();
      setAllTasks([]);
    } catch (err) {
      console.error("Failed to clear data:", err);
      alert("Failed to clear data. Check console for details.");
    }
  }

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
              padding: "8px 16px",
              backgroundColor: "#2196F3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Add Task
          </button>
        </form>
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
                      padding: "6px 12px",
                      backgroundColor: "#f44336",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px",
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
              padding: "8px 16px",
              backgroundColor: "#ff9800",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            Clear All Data
          </button>
          <button
            onClick={handleResetDatabase}
            style={{
              padding: "8px 16px",
              backgroundColor: "#f44336",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            Reset Database & Reload
          </button>
        </div>
        <div style={{ fontSize: "12px", color: "#666" }}>
          <strong>Clear All Data:</strong> Removes all users and tasks but keeps
          the schema.
          <br />
          <strong>Reset Database:</strong> Drops and recreates the entire
          database, then reloads the page.
        </div>
      </details>

      {/* Debug Info */}
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
          {"\n"}Storage: IndexedDB (idb://ordo-db)
          {"\n"}Persistent: Yes - Data survives page refresh
          {"\n"}Origin: {window.location.origin}
          {"\n"}Protocol: {window.location.protocol}
          {"\n"}Storage Available:{" "}
          {typeof Storage !== "undefined" ? "Yes" : "No"}
          {"\n"}IndexedDB Available:{" "}
          {typeof indexedDB !== "undefined" ? "Yes" : "No"}
        </pre>

        {/* Storage Diagnostics */}
        <button
          onClick={async () => {
            try {
              console.log("=== Storage Diagnostics ===");

              // Check storage estimate
              if (navigator.storage && navigator.storage.estimate) {
                const estimate = await navigator.storage.estimate();
                console.log("Storage quota:", estimate.quota || 0);
                console.log("Storage usage:", estimate.usage || 0);
                console.log(
                  "Storage available:",
                  (estimate.quota || 0) - (estimate.usage || 0),
                );
              }

              // Check persistent storage
              if (navigator.storage && navigator.storage.persisted) {
                const isPersistent = await navigator.storage.persisted();
                console.log("Storage is persistent:", isPersistent);
              }

              // List IndexedDB databases
              if (indexedDB.databases) {
                const databases = await indexedDB.databases();
                console.log(
                  "IndexedDB databases:",
                  databases.map((db) => ({
                    name: db.name,
                    version: db.version,
                  })),
                );
              }

              // Check localStorage
              console.log(
                "localStorage available:",
                typeof localStorage !== "undefined",
              );
              console.log(
                "sessionStorage available:",
                typeof sessionStorage !== "undefined",
              );

              alert("Storage diagnostics logged to console");
            } catch (error) {
              console.error("Storage diagnostic error:", error);
              alert("Storage diagnostic failed - check console");
            }
          }}
          style={{
            padding: "6px 12px",
            backgroundColor: "#2196F3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "11px",
            marginTop: "10px",
          }}
        >
          Run Storage Diagnostics
        </button>
      </details>
    </div>
  );
}

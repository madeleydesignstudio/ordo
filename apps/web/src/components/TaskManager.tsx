import { useState, useEffect } from "react";
import { eq } from "drizzle-orm";
import { useDatabase, type User, type Task } from "../hooks/useDatabase";

export function TaskManager() {
  const {
    db,
    isInitialized,
    isLoading,
    error,
    users,
    tasks,
    clearDatabase,
    resetDatabase,
  } = useDatabase();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");

  // Fetch users and tasks
  useEffect(() => {
    if (!isInitialized) return;

    async function fetchData() {
      try {
        const usersData = await db.select().from(users);
        const tasksData = await db.select().from(tasks);
        setAllUsers(usersData);
        setAllTasks(tasksData);

        // Set first user as selected by default
        if (usersData.length > 0 && !selectedUserId) {
          setSelectedUserId(usersData[0]!.id);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    }

    fetchData();
  }, [isInitialized, db, selectedUserId]);

  // Add new user
  async function addUser(e: React.FormEvent) {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    try {
      const newUser = await db
        .insert(users)
        .values({
          name: newUserName.trim(),
          email: newUserEmail.trim(),
        })
        .returning();

      setAllUsers((prev) => [...prev, newUser[0]!]);
      setNewUserName("");
      setNewUserEmail("");
    } catch (err) {
      console.error("Failed to add user:", err);
    }
  }

  // Add new task
  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTaskTitle.trim() || !selectedUserId) return;

    try {
      const newTask = await db
        .insert(tasks)
        .values({
          title: newTaskTitle.trim(),
          description: newTaskDescription.trim() || null,
          userId: selectedUserId,
        })
        .returning();

      setAllTasks((prev) => [...prev, newTask[0]!]);
      setNewTaskTitle("");
      setNewTaskDescription("");
    } catch (err) {
      console.error("Failed to add task:", err);
    }
  }

  // Toggle task completion
  async function toggleTask(taskId: string, completed: boolean) {
    try {
      const updatedTask = await db
        .update(tasks)
        .set({ completed: !completed })
        .where(eq(tasks.id, taskId))
        .returning();

      setAllTasks((prev) =>
        prev.map((task) => (task.id === taskId ? updatedTask[0]! : task)),
      );
    } catch (err) {
      console.error("Failed to toggle task:", err);
    }
  }

  // Delete task
  async function deleteTask(taskId: string) {
    try {
      await db.delete(tasks).where(eq(tasks.id, taskId));
      setAllTasks((prev) => prev.filter((task) => task.id !== taskId));
    } catch (err) {
      console.error("Failed to delete task:", err);
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
      setAllUsers([]);
      setAllTasks([]);
      setSelectedUserId("");
    } catch (err) {
      console.error("Failed to clear data:", err);
      alert("Failed to clear data. Check console for details.");
    }
  }

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <div>🔄 Initializing database...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "red" }}>
        <div>❌ Error: {error}</div>
      </div>
    );
  }

  const selectedUser = allUsers.find((user) => user.id === selectedUserId);
  const userTasks = allTasks.filter((task) => task.userId === selectedUserId);
  const completedTasks = userTasks.filter((task) => task.completed);

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <header style={{ marginBottom: "30px", textAlign: "center" }}>
        <h1>📋 Ordo Task Manager</h1>
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

      {/* Add New User */}
      <section
        style={{
          marginBottom: "30px",
          padding: "20px",
          border: "1px solid #e0e0e0",
          borderRadius: "8px",
        }}
      >
        <h2>👤 Add New User</h2>
        <form
          onSubmit={addUser}
          style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}
        >
          <input
            type="text"
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
            placeholder="User name"
            style={{
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              flex: "1",
              minWidth: "200px",
            }}
          />
          <input
            type="email"
            value={newUserEmail}
            onChange={(e) => setNewUserEmail(e.target.value)}
            placeholder="Email address"
            style={{
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              flex: "1",
              minWidth: "200px",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "8px 16px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Add User
          </button>
        </form>
      </section>

      {/* User Selection */}
      <section style={{ marginBottom: "30px" }}>
        <label
          style={{ display: "block", marginBottom: "10px", fontWeight: "bold" }}
        >
          Select User:
        </label>
        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          style={{
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            width: "100%",
            maxWidth: "300px",
          }}
        >
          <option value="">Choose a user...</option>
          {allUsers.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.email})
            </option>
          ))}
        </select>

        {selectedUser && (
          <div
            style={{
              marginTop: "10px",
              padding: "10px",
              backgroundColor: "#f5f5f5",
              borderRadius: "4px",
            }}
          >
            <strong>{selectedUser.name}</strong> - {selectedUser.email}
            <br />
            <small>
              Created: {selectedUser.createdAt.toLocaleDateString()}
            </small>
          </div>
        )}
      </section>

      {selectedUserId && (
        <>
          {/* Add New Task */}
          <section
            style={{
              marginBottom: "30px",
              padding: "20px",
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
            }}
          >
            <h2>➕ Add New Task for {selectedUser?.name}</h2>
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
                {userTasks.length}
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
                {completedTasks.length}
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
                {userTasks.length - completedTasks.length}
              </div>
              <div style={{ fontSize: "14px", color: "#666" }}>Pending</div>
            </div>
          </section>

          {/* Task List */}
          <section>
            <h2>📝 Tasks for {selectedUser?.name}</h2>
            {userTasks.length === 0 ? (
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
                {userTasks.map((task) => (
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
        </>
      )}

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
          Users: {allUsers.length}
          {"\n"}Tasks: {allTasks.length}
          {"\n"}Database Status: {isInitialized ? "Ready" : "Not Ready"}
          {"\n"}Selected User ID: {selectedUserId || "None"}
          {"\n"}Storage: IndexedDB (idb://ordo-db)
          {"\n"}Persistent: Yes - Data survives page refresh
        </pre>
      </details>
    </div>
  );
}

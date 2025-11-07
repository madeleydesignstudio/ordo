import { useLiveQuery, usePGlite } from "@electric-sql/pglite-react";
import { Component, type ReactNode, useEffect, useState } from "react";

// ============================================================================
// CONSTANTS
// ============================================================================

const API_BASE_URL = "http://localhost:8080";
const SYNC_KEY = "ordo-sync";

// Sync Strategy: Server-first approach to prevent duplicates
// 1. For CREATE: Try server first, if successful let Electric SQL sync back
// 2. For DELETE: Try server first, if successful let Electric SQL sync back
// 3. Fallback to local operations only if server is unreachable
// This prevents duplicate records when Electric SQL syncs server changes back

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Project {
  id: number;
  title: string;
  start_date?: string;
  finish_date?: string;
}

interface Task {
  id: string; // UUID
  project_id: number;
  title: string;
  description?: string;
  start_date?: string;
  finish_date?: string;
  project_title?: string; // Joined from projects table
}

interface NewTask {
  id?: string; // UUID generated client-side
  project_id: number;
  title: string;
  description?: string;
  start_date?: string;
  finish_date?: string;
}

interface QueuedOperation {
  id: string;
  operation_type: "CREATE_TASK" | "DELETE_TASK";
  data: string; // JSON stringified data
  created_at: string;
  retry_count: number;
}

interface DatabaseConnection {
  query: (
    sql: string,
    params?: unknown[],
  ) => Promise<{ rows: Record<string, unknown>[] }>;
  exec: (sql: string) => Promise<void>;
  electric?: {
    syncShapesToTables: (config: Record<string, unknown>) => Promise<void>;
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate a UUID v4
 */
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Insert task only if it doesn't already exist (prevents duplicates)
 */
async function insertTaskIfNotExists(
  db: DatabaseConnection,
  taskId: string,
  newTask: NewTask,
): Promise<void> {
  // Check if task already exists
  const existing = await db.query("SELECT id FROM tasks WHERE id = $1", [
    taskId,
  ]);

  if (existing.rows.length === 0) {
    // Task doesn't exist, safe to insert
    await db.query(
      `INSERT INTO tasks (id, project_id, title, description, start_date, finish_date)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        taskId,
        newTask.project_id,
        newTask.title,
        newTask.description || null,
        newTask.start_date || null,
        newTask.finish_date || null,
      ],
    );
  } else {
    console.log(`Task ${taskId} already exists, skipping insert`);
  }
}

/**
 * Add operation to offline queue
 */
async function enqueueOperation(
  db: DatabaseConnection,
  operationType: "CREATE_TASK" | "DELETE_TASK",
  data: unknown,
): Promise<void> {
  await db.query(
    `INSERT INTO offline_queue (id, operation_type, data, created_at, retry_count)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      generateUUID(),
      operationType,
      JSON.stringify(data),
      new Date().toISOString(),
      0,
    ],
  );
}

/**
 * Process offline queue - retry failed operations
 */
async function processOfflineQueue(db: DatabaseConnection): Promise<void> {
  try {
    // Get pending operations
    const result = await db.query(
      `SELECT * FROM offline_queue ORDER BY created_at ASC LIMIT 10`,
    );

    for (const row of result.rows) {
      const operation = row as unknown as QueuedOperation;

      try {
        let success = false;
        const data = JSON.parse(operation.data);

        if (operation.operation_type === "CREATE_TASK") {
          const response = await fetch(`${API_BASE_URL}/api/tasks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          success = response.ok;
        } else if (operation.operation_type === "DELETE_TASK") {
          const response = await fetch(
            `${API_BASE_URL}/api/tasks/${data.taskId}`,
            {
              method: "DELETE",
            },
          );
          success = response.ok;
        }

        if (success) {
          // Remove from queue on success
          await db.query(`DELETE FROM offline_queue WHERE id = $1`, [
            operation.id,
          ]);
          console.log(`Processed queued ${operation.operation_type} operation`);
        } else {
          // Increment retry count
          await db.query(
            `UPDATE offline_queue SET retry_count = retry_count + 1 WHERE id = $1`,
            [operation.id],
          );
        }
      } catch (error) {
        // Increment retry count on error
        await db.query(
          `UPDATE offline_queue SET retry_count = retry_count + 1 WHERE id = $1`,
          [operation.id],
        );
        console.warn(
          `Failed to process queued operation ${operation.id}:`,
          error,
        );
      }
    }

    // Clean up old failed operations (retry_count > 5 and older than 24 hours)
    await db.query(
      `DELETE FROM offline_queue
       WHERE retry_count > 5
       AND created_at < NOW() - INTERVAL '24 hours'`,
    );
  } catch (error) {
    console.error("Error processing offline queue:", error);
  }
}

/**
 * Check online status and process queue
 */
async function checkConnectionAndProcessQueue(
  db: DatabaseConnection,
): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    // Try health check endpoint first
    let response;
    try {
      response = await fetch(`${API_BASE_URL}/health`, {
        method: "HEAD",
        signal: controller.signal,
      });
    } catch {
      // Fallback to main API endpoint
      response = await fetch(`${API_BASE_URL}/api/tasks`, {
        method: "HEAD",
        signal: controller.signal,
      });
    }

    clearTimeout(timeoutId);
    const isOnline = response.ok;

    if (isOnline) {
      await processOfflineQueue(db);
    }

    return isOnline;
  } catch {
    return false;
  }
}

// ============================================================================
// COMPONENTS
// ============================================================================

/**
 * Delete button component with confirmation dialog
 */
function DeleteButton({
  taskId,
  taskTitle,
  db,
}: {
  taskId: string;
  taskTitle: string;
  db: DatabaseConnection & {
    electric: NonNullable<DatabaseConnection["electric"]>;
  };
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    setIsDeleting(true);
    try {
      // Try to delete from server first
      try {
        const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          // Server deletion successful - Electric SQL will sync the deletion back
          console.log(
            "Task deleted on server, will be synced back via Electric SQL",
          );
        } else {
          // Server failed, queue for later and delete locally
          console.warn(
            "Server delete failed, queuing for retry and deleting locally",
          );
          await enqueueOperation(db, "DELETE_TASK", { taskId });
          await db.query("DELETE FROM tasks WHERE id = $1", [taskId]);
        }
      } catch (error) {
        // Network error, queue for later and delete locally
        console.warn(
          "Network error, queuing for retry and deleting locally:",
          error,
        );
        await enqueueOperation(db, "DELETE_TASK", { taskId });
        await db.query("DELETE FROM tasks WHERE id = $1", [taskId]);
      }
    } catch (error) {
      console.error("Failed to delete task:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to delete task: ${message}`);
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  if (showConfirm) {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-xs text-gray-600">Delete {taskTitle}?</span>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          {isDeleting ? "..." : "Yes"}
        </button>
        <button
          onClick={handleCancel}
          className="px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleDelete}
      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors duration-200 border border-red-300"
    >
      Delete
    </button>
  );
}

/**
 * Modal form for creating new tasks
 */
function CreateTaskForm({
  projects,
  db,
  onClose,
}: {
  projects: Project[];
  db: DatabaseConnection & {
    electric: NonNullable<DatabaseConnection["electric"]>;
  };
  onClose: () => void;
}) {
  const [newTask, setNewTask] = useState<NewTask>({
    project_id: projects[0]?.id || 0,
    title: "",
    description: "",
    start_date: "",
    finish_date: "",
  });
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTask.title.trim()) {
      alert("Task title is required");
      return;
    }

    if (!newTask.project_id) {
      alert("Please select a project");
      return;
    }

    setIsCreating(true);
    try {
      // Generate UUID client-side to ensure consistency
      const taskId = generateUUID();
      const taskWithId = { ...newTask, id: taskId };

      // Try to create on server first
      try {
        const response = await fetch(`${API_BASE_URL}/api/tasks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(taskWithId),
        });

        if (response.ok) {
          // Server creation successful - Electric SQL will sync it back down
          // Don't insert locally to avoid duplicates
          console.log(
            "Task created on server, will be synced back via Electric SQL",
          );
        } else {
          // Server failed, queue for later and create locally
          console.warn(
            "Server create failed, queuing for retry and creating locally",
          );
          await enqueueOperation(db, "CREATE_TASK", taskWithId);
          await insertTaskIfNotExists(db, taskId, newTask);
        }
      } catch (error) {
        // Network error, queue for later and create locally
        console.warn(
          "Network error, queuing for retry and creating locally:",
          error,
        );
        await enqueueOperation(db, "CREATE_TASK", taskWithId);
        await insertTaskIfNotExists(db, taskId, newTask);
      }

      // Reset form and close
      setNewTask({
        project_id: projects[0]?.id || 0,
        title: "",
        description: "",
        start_date: "",
        finish_date: "",
      });
      onClose();
    } catch (error) {
      console.error("Failed to create task:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to create task: ${message}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Create New Task
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project
            </label>
            <select
              value={newTask.project_id}
              onChange={(e) =>
                setNewTask({ ...newTask, project_id: parseInt(e.target.value) })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Title
            </label>
            <input
              type="text"
              value={newTask.title}
              onChange={(e) =>
                setNewTask({ ...newTask, title: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter task title..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              value={newTask.description}
              onChange={(e) =>
                setNewTask({ ...newTask, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter task description..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={newTask.start_date}
                onChange={(e) =>
                  setNewTask({ ...newTask, start_date: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Finish Date
              </label>
              <input
                type="date"
                value={newTask.finish_date}
                onChange={(e) =>
                  setNewTask({ ...newTask, finish_date: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={isCreating}
            >
              {isCreating ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Main component for managing projects and tasks with Electric SQL sync
 */
const PGTaskTable = () => {
  const db = usePGlite();
  const [isReady, setIsReady] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [queueCount, setQueueCount] = useState(0);

  // ============================================================================
  // DATABASE SETUP & SYNC
  // ============================================================================

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        // Create projects table
        await db.exec(`
          CREATE TABLE IF NOT EXISTS projects (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            start_date DATE,
            finish_date DATE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `);

        // Create offline queue table
        await db.exec(`
          CREATE TABLE IF NOT EXISTS offline_queue (
            id TEXT PRIMARY KEY,
            operation_type TEXT NOT NULL,
            data TEXT NOT NULL,
            created_at TEXT NOT NULL,
            retry_count INTEGER DEFAULT 0
          );
        `);

        // Check if tasks table exists with wrong schema and drop it
        const tableCheck = await db.query(`
          SELECT column_name, data_type
          FROM information_schema.columns
          WHERE table_name = 'tasks' AND column_name = 'id'
        `);

        if (tableCheck.rows.length > 0) {
          const firstRow = tableCheck.rows[0] as { data_type: string };
          if (firstRow.data_type !== "uuid") {
            console.log("Migrating tasks table from integer to UUID...");
            await db.exec(`DROP TABLE IF EXISTS tasks CASCADE;`);
          }
        }

        // Create tasks table with UUID primary key
        await db.exec(`
          CREATE TABLE IF NOT EXISTS tasks (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            project_id INTEGER NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            start_date DATE,
            finish_date DATE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
            UNIQUE(id) -- Explicit unique constraint to prevent duplicates during sync
          );
        `);

        // Set up Electric SQL sync with server
        try {
          await db.electric?.syncShapesToTables({
            shapes: {
              projects: {
                shape: {
                  url: `${API_BASE_URL}/shape`,
                  params: { table: "projects" },
                },
                table: "projects",
                primaryKey: ["id"],
              },
              tasks: {
                shape: {
                  url: `${API_BASE_URL}/shape`,
                  params: { table: "tasks" },
                },
                table: "tasks",
                primaryKey: ["id"],
              },
            },
            key: SYNC_KEY,
          });
        } catch (syncError) {
          const errorMessage =
            syncError instanceof Error ? syncError.message : "";
          if (!errorMessage.includes("Already syncing")) {
            console.error("Sync setup failed:", syncError);
          }
        }

        setIsReady(true);
      } catch (error) {
        console.error("Database setup failed:", error);
        setIsReady(true);
      }
    };

    initializeDatabase();
  }, [db]);

  // Set up connection monitoring and queue processing
  useEffect(() => {
    if (!isReady) return;

    const checkConnection = async () => {
      const online = await checkConnectionAndProcessQueue(
        db as unknown as DatabaseConnection,
      );
      setIsOnline(online);

      // Update queue count
      try {
        const result = await db.query(
          "SELECT COUNT(*) as count FROM offline_queue",
        );
        const count = (result.rows[0] as { count: number }).count;
        setQueueCount(count);
      } catch (error) {
        console.error("Failed to get queue count:", error);
      }
    };

    // Check immediately
    checkConnection();

    // Set up periodic checking
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [isReady, db]);

  // ============================================================================
  // DATA QUERIES
  // ============================================================================

  const projects = useLiveQuery("SELECT * FROM projects ORDER BY id", []);
  const tasks = useLiveQuery(
    `SELECT t.*, p.title as project_title
     FROM tasks t
     LEFT JOIN projects p ON t.project_id = p.id
     ORDER BY t.id`,
    [],
  );

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const formatDate = (dateValue?: string | Date | null): string => {
    if (!dateValue) return "Not set";

    try {
      if (typeof dateValue === "string") return dateValue;
      if (dateValue instanceof Date) {
        return dateValue.toISOString().split("T")[0];
      }
      return String(dateValue);
    } catch {
      return "Invalid date";
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!isReady) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          PG Tasks & Projects
        </h1>
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Setting up database...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        PG Tasks & Projects
      </h1>

      <div className="mb-6 space-y-2">
        <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-md p-3">
          ⚡ Electric SQL Sync Active - Local PGlite synced with cloud database
        </div>

        {/* Connection and Queue Status */}
        <div
          className={`text-sm p-3 rounded-md border ${
            isOnline
              ? "text-green-700 bg-green-50 border-green-200"
              : "text-amber-700 bg-amber-50 border-amber-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span>
              {isOnline ? "🟢 Online" : "🟡 Offline"}
              {queueCount > 0 && ` • ${queueCount} queued operations`}
            </span>
            {!isOnline && queueCount > 0 && (
              <span className="text-xs">
                Changes will sync when connection is restored
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Projects ({projects?.rows?.length || 0})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects?.rows?.length ? (
            (projects.rows as unknown as Project[]).map((project) => (
              <div key={project.id} className="bg-white rounded-lg border p-4">
                <h3 className="font-semibold text-gray-800">
                  {String(project.title || "Untitled")}
                </h3>
                <div className="text-sm text-gray-600 mt-2">
                  <div>Start: {formatDate(project.start_date)}</div>
                  <div>End: {formatDate(project.finish_date)}</div>
                  <div className="font-mono text-xs bg-gray-100 px-2 py-1 rounded inline-block mt-1">
                    ID: {String(project.id)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-500 text-center py-8">
              No projects found. Create a project to see it sync automatically.
            </div>
          )}
        </div>
      </div>

      {/* Tasks Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Tasks ({tasks?.rows?.length || 0})
          </h2>
          <button
            onClick={() => setShowCreateForm(true)}
            disabled={!projects?.rows?.length}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {projects?.rows?.length ? "Create Task" : "No Projects Available"}
          </button>
        </div>

        <div className="space-y-4">
          {tasks?.rows?.length ? (
            (tasks.rows as unknown as Task[]).map((task) => (
              <div key={task.id} className="bg-white rounded-lg border p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">
                      {String(task.title || "Untitled")}
                    </h3>
                    <div className="text-sm text-blue-600 font-medium mt-1">
                      📋{" "}
                      {String(
                        task.project_title || `Project #${task.project_id}`,
                      )}
                    </div>
                    {task.description && (
                      <p className="text-gray-600 mt-2">
                        {String(task.description)}
                      </p>
                    )}
                    <div className="flex gap-4 text-sm text-gray-500 mt-2">
                      <span>Start: {formatDate(task.start_date)}</span>
                      <span>End: {formatDate(task.finish_date)}</span>
                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                        ID: {String(task.id)}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <DeleteButton
                      taskId={task.id}
                      taskTitle={task.title}
                      db={
                        db as unknown as DatabaseConnection & {
                          electric: NonNullable<DatabaseConnection["electric"]>;
                        }
                      }
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-500 text-center py-8">
              No tasks found. Create a task to see it sync automatically.
            </div>
          )}
        </div>
      </div>

      {/* System Info */}
      <div className="mt-8 bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          🔄 Electric SQL + PGlite Sync
        </h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>✅ Local PGlite database with persistent storage</li>
          <li>✅ Real-time sync from cloud Postgres</li>
          <li>✅ Live queries with automatic updates</li>
          <li>✅ Offline-first architecture</li>
          <li>✅ Create and delete tasks with dual sync</li>
        </ul>
      </div>

      {/* Create Task Form Modal */}
      {showCreateForm && projects?.rows?.length && db.electric && (
        <CreateTaskForm
          projects={projects.rows as unknown as Project[]}
          db={
            db as unknown as DatabaseConnection & {
              electric: NonNullable<DatabaseConnection["electric"]>;
            }
          }
          onClose={() => setShowCreateForm(false)}
        />
      )}
    </div>
  );
};

/**
 * Error boundary to catch and handle React errors in the PGTaskTable component
 */
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("PGTaskTable error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-6xl mx-auto p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            PG Tasks & Projects
          </h1>
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-red-800">Display Error</h3>
            <p className="mt-2 text-sm text-red-700">
              {this.state.error?.message || "Something went wrong"}
            </p>
            <button
              onClick={() =>
                this.setState({ hasError: false, error: undefined })
              }
              className="mt-3 px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Main export with error boundary wrapper
 */
const PGTaskTableWithErrorBoundary = () => (
  <ErrorBoundary>
    <PGTaskTable />
  </ErrorBoundary>
);

export default PGTaskTableWithErrorBoundary;

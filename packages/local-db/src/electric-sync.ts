import { Mutex } from "@electric-sql/pglite";
// Type imports
import type { PGliteWithLive } from "@electric-sql/pglite/live";
import type { PGliteWithSync } from "@electric-sql/pglite-sync";
import { useEffect, useState } from "react";

const WRITE_SERVER_URL = import.meta.env?.VITE_WRITE_SERVER_URL
  ? import.meta.env.VITE_WRITE_SERVER_URL
  : "http://localhost:3001";
const ELECTRIC_URL = import.meta.env?.VITE_ELECTRIC_URL
  ? new URL(import.meta.env.VITE_ELECTRIC_URL).origin
  : "http://localhost:3000";
const ELECTRIC_SOURCE_ID = import.meta.env?.VITE_ELECTRIC_SOURCE_ID;
const ELECTRIC_SOURCE_SECRET = import.meta.env?.VITE_ELECTRIC_SOURCE_SECRET;
const APPLY_CHANGES_URL = `${WRITE_SERVER_URL}/apply-changes`;

type SyncStatus = "initial-sync" | "done";

type PGliteWithExtensions = PGliteWithLive & PGliteWithSync;

export interface TaskChange {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  dueDate: Date | null;
  modifiedColumns: string | null;
  deleted: boolean;
  new: boolean;
  username: string | null;
}

export interface ChangeSet {
  tasks: TaskChange[];
}

export async function startSync(pg: PGliteWithExtensions) {
  await startSyncToDatabase(pg);
  startWritePath(pg);
}

async function startSyncToDatabase(pg: PGliteWithExtensions) {
  // Check if there are any tasks already in the database
  const tasks = await pg.query("SELECT 1 FROM tasks LIMIT 1");
  const hasTasksAtStart = tasks.rows.length > 0;

  let taskShapeInitialSyncDone = false;
  let postInitialSyncDone = false;

  if (!hasTasksAtStart && !postInitialSyncDone) {
    updateSyncStatus("initial-sync", "Downloading shape data...");
  }

  let postInitialSyncDoneResolver: () => void;
  const postInitialSyncDonePromise = new Promise<void>((resolve) => {
    postInitialSyncDoneResolver = resolve;
  });

  const doPostInitialSync = async () => {
    if (!hasTasksAtStart && taskShapeInitialSyncDone && !postInitialSyncDone) {
      postInitialSyncDone = true;
      updateSyncStatus("initial-sync", "Creating indexes...");
      await postInitialSync(pg);
      postInitialSyncDoneResolver();
    }
  };

  const taskUrl = new URL(`${ELECTRIC_URL}/v1/shape`);
  if (ELECTRIC_SOURCE_SECRET) {
    taskUrl.searchParams.set("secret", ELECTRIC_SOURCE_SECRET);
  }

  // Tasks Sync
  const tasksSync = await pg.electric.syncShapeToTable({
    shape: {
      url: taskUrl.toString(),
      params: {
        table: "tasks",
        source_id: ELECTRIC_SOURCE_ID,
      },
    },
    table: "tasks",
    primaryKey: ["id"],
    shapeKey: "tasks",
    initialInsertMethod: "json",
    onInitialSync: async () => {
      taskShapeInitialSyncDone = true;
      await pg.exec("ALTER TABLE tasks ENABLE TRIGGER ALL");
      doPostInitialSync();
    },
  });

  // Set up subscription for ongoing sync updates
  if (typeof tasksSync.unsubscribe === "function") {
    // Handle sync updates - the API might be different than expected
    console.log("Tasks sync subscription created successfully");
    if (!hasTasksAtStart && !postInitialSyncDone) {
      updateSyncStatus("initial-sync", "Inserting tasks...");
    }
  }

  if (!hasTasksAtStart) {
    await postInitialSyncDonePromise;
    await pg.query("SELECT 1;"); // Do a query to ensure PGlite is idle
  }
  updateSyncStatus("done");
}

const syncMutex = new Mutex();

async function startWritePath(pg: PGliteWithExtensions) {
  // Use a live query to watch for changes to the local tables that need to be synced
  if (pg.live && typeof pg.live.query === "function") {
    pg.live.query(
      "SELECT count(id) as task_count FROM tasks WHERE synced = false",
      [],
      async (results: { rows: Array<{ task_count: number }> }) => {
        const row = results.rows[0];
        if (row && row.task_count > 0) {
          await syncMutex.acquire();
          try {
            await doSyncToServer(pg);
          } finally {
            syncMutex.release();
          }
        }
      }
    );
  } else {
    console.warn("Live queries not available - write path sync disabled");
  }
}

// Call wrapped in mutex to prevent multiple syncs from happening at the same time
async function doSyncToServer(pg: PGliteWithExtensions) {
  let taskChanges: TaskChange[] = [];
  await pg.transaction(async (tx) => {
    const taskRes = await tx.query<TaskChange>(`
      SELECT
        id,
        title,
        description,
        completed,
        created_at as "createdAt",
        updated_at as "updatedAt",
        due_date as "dueDate",
        modified_columns as "modifiedColumns",
        deleted,
        new,
        username
      FROM tasks
      WHERE synced = false AND sent_to_server = false
    `);
    taskChanges = taskRes.rows;
  });

  const changeSet: ChangeSet = {
    tasks: taskChanges,
  };

  const response = await fetch(APPLY_CHANGES_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(changeSet),
  });

  if (!response.ok) {
    // In a real app you would want to check which changes have failed and save that
    // information to the database, maybe in a `sync_errors` column on the row effected.
    throw new Error("Failed to apply changes");
  }

  await pg.transaction(async (tx) => {
    // Mark all changes as sent to server, but check that the modified timestamp
    // has not changed in the meantime

    tx.exec("SET LOCAL electric.bypass_triggers = true");

    for (const task of taskChanges) {
      await tx.query("UPDATE tasks SET sent_to_server = true WHERE id = $1 AND updated_at = $2", [
        task.id,
        task.updatedAt,
      ]);
    }
  });
}

async function postInitialSync(_pg: PGliteWithExtensions) {
  // Create any indexes or perform any other post-sync setup here
  console.log("Post-initial sync setup completed");
}

export function updateSyncStatus(newStatus: SyncStatus, message?: string) {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("syncStatus", JSON.stringify([newStatus, message]));
    // Fire a storage event on this tab as this doesn't happen automatically
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "syncStatus",
          newValue: JSON.stringify([newStatus, message]),
        })
      );
    }
  }
}

export function useSyncStatus() {
  const currentSyncStatusJson =
    typeof localStorage !== "undefined" ? localStorage.getItem("syncStatus") : null;
  const currentSyncStatus: [SyncStatus, string] = currentSyncStatusJson
    ? JSON.parse(currentSyncStatusJson)
    : ["initial-sync", "Starting sync..."];
  const [syncStatus, setSyncStatus] = useState<[SyncStatus, string]>(currentSyncStatus);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "syncStatus" && e.newValue) {
        const [newStatus, message] = JSON.parse(e.newValue);
        setSyncStatus([newStatus, message]);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return syncStatus;
}

let initialSyncDone = false;

export function waitForInitialSyncDone() {
  return new Promise<void>((resolve) => {
    if (initialSyncDone) {
      resolve();
      return;
    }

    if (typeof window === "undefined") {
      resolve();
      return;
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "syncStatus" && e.newValue) {
        const [newStatus] = JSON.parse(e.newValue);
        if (newStatus === "done") {
          window.removeEventListener("storage", handleStorageChange);
          initialSyncDone = true;
          resolve();
        }
      }
    };

    // Check current status first
    const currentSyncStatusJson = localStorage.getItem("syncStatus");
    const [currentStatus] = currentSyncStatusJson
      ? JSON.parse(currentSyncStatusJson)
      : ["initial-sync"];

    if (currentStatus === "done") {
      initialSyncDone = true;
      resolve();
    } else {
      window.addEventListener("storage", handleStorageChange);
    }
  });
}

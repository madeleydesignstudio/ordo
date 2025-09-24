export interface TaskChange {
  id: string
  title: string
  description: string | null
  completed: boolean
  createdAt: Date
  updatedAt: Date
  dueDate: Date | null
  modifiedColumns: string | null
  deleted: boolean
  new: boolean
  username: string | null
}

export interface ChangeSet {
  tasks: TaskChange[]
}

// Utility to track which columns have been modified
export function trackModifiedColumns(
  originalTask: Partial<TaskChange>,
  updatedTask: Partial<TaskChange>
): string[] {
  const modifiedColumns: string[] = []
  
  const fieldsToTrack = [
    'title',
    'description', 
    'completed',
    'dueDate',
    'username'
  ] as const

  for (const field of fieldsToTrack) {
    if (originalTask[field] !== updatedTask[field]) {
      modifiedColumns.push(field)
    }
  }

  return modifiedColumns
}

// Utility to prepare a task for sync
export function prepareTaskForSync(
  task: Partial<TaskChange>,
  modifiedColumns?: string[]
): Partial<TaskChange> {
  return {
    ...task,
    synced: false,
    sentToServer: false,
    modifiedColumns: modifiedColumns ? modifiedColumns.join(',') : null,
    updatedAt: new Date(),
  }
}

// Utility to mark a task as synced
export function markTaskAsSynced(taskId: string): Partial<TaskChange> {
  return {
    id: taskId,
    synced: true,
    sentToServer: true,
  }
}

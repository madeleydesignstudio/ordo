// User types (existing)
export interface User {
  id: number;
  email: string;
  name: string;
  [key: string]: any; // This satisfies the Row<unknown> constraint
}

// Project types
export interface Project {
  id: number;
  title: string;
  start_date?: string | null;
  finish_date?: string | null;
  created_at: string;
  updated_at: string;
  [key: string]: any; // This satisfies the Row<unknown> constraint
}

// Task types
export interface Task {
  id: number;
  project_id: number;
  title: string;
  description?: string;
  start_date?: string | null;
  finish_date?: string | null;
  created_at: string;
  updated_at: string;
  [key: string]: any; // This satisfies the Row<unknown> constraint
}

// API response types
export interface ProjectWithTasks {
  project: Project;
  tasks: Task[];
}

// Form types for creating/updating
export interface CreateProjectForm {
  title: string;
  start_date?: string;
  finish_date?: string;
}

export interface CreateTaskForm {
  project_id: number;
  title: string;
  description?: string;
  start_date?: string;
  finish_date?: string;
}

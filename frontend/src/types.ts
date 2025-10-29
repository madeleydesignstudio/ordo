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

// Form data types for creating/updating (renamed to avoid conflicts)
export interface CreateProjectData {
  title: string;
  start_date?: string;
  finish_date?: string;
}

export interface CreateTaskData {
  project_id: number;
  title: string;
  description?: string;
  start_date?: string;
  finish_date?: string;
}

export interface CreateProjectData {
  title: string;
  start_date?: string;
  finish_date?: string;
}

export interface CreateTaskData {
  project_id: number;
  title: string;
  description?: string;
  start_date?: string;
  finish_date?: string;
}

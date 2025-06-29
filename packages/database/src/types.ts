import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { tasks, projects, projectTasks } from './schema';

// Task types
export type Task = InferSelectModel<typeof tasks>;
export type NewTask = InferInsertModel<typeof tasks>;
export type TaskUpdate = Partial<NewTask>;

// Project types
export type Project = InferSelectModel<typeof projects>;
export type NewProject = InferInsertModel<typeof projects>;
export type ProjectUpdate = Partial<NewProject>;

// Project task junction types
export type ProjectTask = InferSelectModel<typeof projectTasks>;
export type NewProjectTask = InferInsertModel<typeof projectTasks>;

// Extended types with relations
export type ProjectWithTasks = Project & {
  projectTasks: (ProjectTask & {
    task: Task;
  })[];
};

// Task with project info
export type TaskWithProject = Task & {
  projectTasks: (ProjectTask & {
    project: Project;
  })[];
}; 
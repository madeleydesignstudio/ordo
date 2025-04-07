export type Task = {
  id: number;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "in_review" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  projectId: number;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Project = {
  id: number;
  name: string;
  description: string | null;
  status: "not_started" | "in_progress" | "on_hold" | "completed" | "cancelled";
  startDate: string;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  tasks: Task[];
};

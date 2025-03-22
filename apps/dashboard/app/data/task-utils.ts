import { tasks2025 } from "./tasks-2025";

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
}

export interface DayTasks {
  date: string;
  tasks: Task[];
}

export function getTasksForDate(date: Date): Task[] {
  const dateString = date.toISOString().split("T")[0];
  const dayData = tasks2025.find((day) => day.date === dateString);
  return dayData?.tasks || [];
}

export function getTasksForDateRange(
  startDate: Date,
  endDate: Date
): DayTasks[] {
  const start = startDate.toISOString().split("T")[0];
  const end = endDate.toISOString().split("T")[0];

  return tasks2025.filter((day) => day.date >= start && day.date <= end);
}

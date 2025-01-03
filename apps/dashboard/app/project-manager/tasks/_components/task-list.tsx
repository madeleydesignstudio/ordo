"use client";

import { Task } from "@/types/task";
import { TaskCard } from "./task-card";

interface TaskListProps {
  tasks: Task[];
  onTaskUpdate: () => void;
}

export function TaskList({ tasks, onTaskUpdate }: TaskListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} onStatusChange={onTaskUpdate} />
      ))}
    </div>
  );
}

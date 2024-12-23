"use client";

import { format } from "date-fns";
import { Task } from "../../../../types/task";
import { cn } from "../../../../lib/utils";
import { Button } from "../../../components/ui/button";
import { CheckCircle, Circle } from "lucide-react";
import { updateTaskStatus } from "../../../../lib/tasks";
import { toast } from "sonner";

interface TaskCalendarDayProps {
  date: Date;
  tasks: Task[];
  isToday: boolean;
  isCurrentMonth: boolean;
  onTaskUpdate: () => void;
}

export function TaskCalendarDay({
  date,
  tasks,
  isToday,
  isCurrentMonth,
  onTaskUpdate,
}: TaskCalendarDayProps) {
  const handleStatusChange = async (
    taskId: string,
    status: "pending" | "completed"
  ) => {
    try {
      await updateTaskStatus(taskId, status);
      toast.success("Task updated successfully");
      onTaskUpdate();
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  return (
    <div
      className={cn(
        "min-h-[120px] p-2 bg-white",
        !isCurrentMonth && "bg-gray-50 text-gray-500",
        "hover:bg-gray-50 transition-colors"
      )}
    >
      <div className="flex justify-between items-start">
        <span
          className={cn(
            "text-sm font-semibold",
            isToday && "text-blue-600",
            !isCurrentMonth && "text-gray-400"
          )}
        >
          {format(date, "d")}
        </span>
      </div>
      <div className="mt-2 space-y-1">
        {tasks.map((task) => {
          const isCompleted = task.status === "completed";
          return (
            <div
              key={task.id}
              className={cn(
                "flex items-center gap-2 text-sm p-1 rounded",
                isCompleted && "opacity-50"
              )}
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() =>
                  handleStatusChange(
                    task.id,
                    isCompleted ? "pending" : "completed"
                  )
                }
              >
                {isCompleted ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
              </Button>
              <span
                className={cn(
                  "truncate",
                  isCompleted && "line-through text-gray-500"
                )}
              >
                {task.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

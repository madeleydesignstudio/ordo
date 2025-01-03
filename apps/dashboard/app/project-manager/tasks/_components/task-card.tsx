import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { CheckCircle, Circle } from "lucide-react";
import { Task } from "../../../../types/task";

interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: string, status: "pending" | "completed") => void;
}

export function TaskCard({ task, onStatusChange }: TaskCardProps) {
  const isCompleted = task.status === "completed";

  return (
    <Card className={isCompleted ? "opacity-75" : ""}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <CardTitle className={isCompleted ? "line-through text-gray-500" : ""}>
          {task.title}
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            onStatusChange(task.id, isCompleted ? "pending" : "completed")
          }
          className="h-8 w-8"
        >
          {isCompleted ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <Circle className="h-5 w-5" />
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <p className={`text-gray-600 ${isCompleted ? "line-through" : ""}`}>
          {task.description}
        </p>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Priority:</span>
            <span className="text-sm font-medium">{task.priority}</span>
          </div>
          {task.due_date && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Due:</span>
              <span className="text-sm font-medium">
                {format(new Date(task.due_date), "PPP")}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

import { format } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@ordo/ui/components/button";
import { routinesQueryOptions, updateRoutineItem } from "@/lib/home/queries";
import { TimeBasedRoutine } from "@/lib/home/types";

interface RoutineComponentProps {
  activeDate: Date;
}

function getTimeBasedRoutine(
  routineData: any,
  activeDate: Date,
): TimeBasedRoutine {
  const hour = activeDate.getHours();

  if (hour >= 5 && hour < 12) {
    return {
      title: "Morning Routine",
      items: routineData?.morning || [],
      type: "morning",
    };
  } else if (hour >= 12 && hour < 18) {
    return {
      title: "Current Tasks",
      items: routineData?.currentTasks || [],
      type: "day",
    };
  } else {
    return {
      title: "Nightly Cooldown",
      items: routineData?.evening || [],
      type: "evening",
    };
  }
}

export function RoutineComponent({ activeDate }: RoutineComponentProps) {
  const queryClient = useQueryClient();

  const {
    data: routineData,
    isLoading,
    error,
  } = useQuery(routinesQueryOptions());

  const updateItemMutation = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      updateRoutineItem(id, completed),
    onSuccess: (data, variables) => {
      // Invalidate and refetch routines data
      queryClient.invalidateQueries({ queryKey: ["routines"] });

      // Show success message in console for now
      const action = variables.completed ? "completed" : "uncompleted";
      console.log(`Routine item ${action} successfully`);
    },
    onError: (error: any) => {
      // Handle error and log for now
      const errorMessage = error?.message || "Failed to update routine item";
      console.error("Failed to update routine item:", errorMessage);
    },
  });

  const handleItemToggle = (id: string, currentCompleted: boolean) => {
    updateItemMutation.mutate({ id, completed: !currentCompleted });
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-4 flex-1">
        <div className="flex items-center justify-between mb-3">
          <div className="h-5 w-32 bg-muted animate-pulse rounded"></div>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-muted animate-pulse rounded"></div>
              <div className="h-4 w-40 bg-muted animate-pulse rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border bg-card p-4 flex-1">
        <h3 className="text-base font-semibold mb-3 text-muted-foreground">
          Routine
        </h3>
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Failed to load routine data
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ["routines"] });
                console.log("Retrying to load routine data...");
              }}
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const routine = getTimeBasedRoutine(routineData, activeDate);

  return (
    <div className="rounded-lg border bg-card p-4 flex-1">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-muted-foreground">
          {routine.title}
        </h3>
        {routine.type === "evening" && (
          <span className="text-sm text-primary">Meditate</span>
        )}
      </div>

      {routine.type === "evening" ? (
        <div className="space-y-3">
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-sm font-medium">
              Good evening {format(activeDate, "EEEE")}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Time to cooldown and setup for tomorrow.
            </p>
          </div>

          <div className="space-y-2">
            {routine.items.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="flex items-center space-x-2 text-sm"
              >
                <button
                  onClick={() => handleItemToggle(item.id, item.completed)}
                  disabled={updateItemMutation.isPending}
                  className={`w-3 h-3 rounded border-2 transition-colors ${
                    item.completed
                      ? "bg-primary border-primary"
                      : "border-muted-foreground hover:border-primary"
                  } ${updateItemMutation.isPending ? "opacity-50" : ""}`}
                />
                <span
                  className={
                    item.completed ? "line-through text-muted-foreground" : ""
                  }
                >
                  {item.title}
                </span>
                {item.timeEstimate && (
                  <span className="text-muted-foreground ml-auto text-xs">
                    {item.timeEstimate}
                  </span>
                )}
              </div>
            ))}
          </div>

          <Button variant="outline" size="sm" className="w-full mt-3">
            View Routine
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {routine.items.length > 0 ? (
            routine.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center space-x-2 p-2 rounded hover:bg-muted/30 transition-colors"
              >
                <button
                  onClick={() => handleItemToggle(item.id, item.completed)}
                  disabled={updateItemMutation.isPending}
                  className={`w-3 h-3 rounded border-2 transition-colors ${
                    item.completed
                      ? "bg-primary border-primary"
                      : "border-muted-foreground hover:border-primary"
                  } ${updateItemMutation.isPending ? "opacity-50" : ""}`}
                />
                <div className="flex-1">
                  <p
                    className={`text-sm ${
                      item.completed ? "line-through text-muted-foreground" : ""
                    }`}
                  >
                    {item.title}
                  </p>
                  {item.timeEstimate && (
                    <p className="text-xs text-muted-foreground">
                      {item.timeEstimate}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center h-20">
              <p className="text-sm text-muted-foreground">
                No {routine.type === "morning" ? "morning routine" : "tasks"}{" "}
                for today
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

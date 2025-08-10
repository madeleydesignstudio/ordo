import { format, addDays, subDays, isSameDay, startOfDay } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@ordo/ui/components/button";
import { WeekDay, DayEvent } from "@/lib/home/types";
import { weekEventsQueryOptions, addEvent } from "@/lib/home/queries";

interface WeeklyCalendarComponentProps {
  activeDate: Date;
  onActiveDateChange: (date: Date) => void;
}

function generateWeekData(
  centerDate: Date,
  eventsData?: Record<string, DayEvent[]>,
): WeekDay[] {
  // Generate 7 days with centerDate in the middle (index 3)
  const days: WeekDay[] = [];

  for (let i = -3; i <= 3; i++) {
    const date = addDays(centerDate, i);
    const dayName = format(date, "EEEE").toUpperCase();
    const dayNumber = date.getDate();
    const dateKey = format(date, "yyyy-MM-dd");

    // Get events from query data or empty array
    const events = eventsData?.[dateKey] || [];

    days.push({ date, dayName, dayNumber, events });
  }

  return days;
}

export function WeeklyCalendarComponent({
  activeDate,
  onActiveDateChange,
}: WeeklyCalendarComponentProps) {
  const queryClient = useQueryClient();

  // Calculate week range for API call
  const startDate = format(subDays(activeDate, 3), "yyyy-MM-dd");
  const endDate = format(addDays(activeDate, 3), "yyyy-MM-dd");

  const {
    data: eventsData,
    isLoading,
    error,
  } = useQuery(weekEventsQueryOptions(startDate, endDate));

  const addEventMutation = useMutation({
    mutationFn: ({
      date,
      title,
      priority,
    }: {
      date: string;
      title: string;
      priority: "high" | "medium" | "low";
    }) => addEvent(date, title, priority),
    onSuccess: () => {
      // Invalidate and refetch events data
      queryClient.invalidateQueries({ queryKey: ["week-events"] });
    },
  });

  const weekData = generateWeekData(activeDate, eventsData?.events);

  const navigatePrevious = () => {
    onActiveDateChange(subDays(activeDate, 1));
  };

  const navigateNext = () => {
    onActiveDateChange(addDays(activeDate, 1));
  };

  const goToToday = () => {
    onActiveDateChange(startOfDay(new Date()));
  };

  const handleAddEvent = (date: Date) => {
    const dateKey = format(date, "yyyy-MM-dd");
    const title = prompt("Enter event title:");

    if (title && title.trim()) {
      addEventMutation.mutate({
        date: dateKey,
        title: title.trim(),
        priority: "medium", // Default priority
      });
    }
  };

  if (error) {
    return (
      <div className="rounded-lg border bg-card p-4 flex-1">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-muted-foreground">
            This Week
          </h3>
        </div>
        <div className="flex items-center justify-center h-32">
          <p className="text-sm text-muted-foreground">
            Failed to load calendar events
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-4 flex-1">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <h3 className="text-base font-semibold text-muted-foreground">
            {format(activeDate, "MMMM yyyy")}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="text-xs"
          >
            Today
          </Button>
        </div>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" onClick={navigatePrevious}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={navigateNext}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekData.map((day, index) => {
          const isActiveDay = isSameDay(day.date, activeDate);
          const isToday = isSameDay(day.date, new Date());
          const isCenterDay = index === 3; // Center position

          return (
            <div key={day.date.toISOString()} className="space-y-1">
              <div className="text-center">
                <p className="text-xs font-medium text-muted-foreground">
                  {day.dayName}
                </p>
                <button
                  onClick={() => onActiveDateChange(day.date)}
                  className={`text-sm font-semibold rounded-full w-8 h-8 flex items-center justify-center mx-auto transition-colors hover:bg-muted/40 ${
                    isActiveDay
                      ? "bg-primary text-primary-foreground"
                      : isToday
                        ? "bg-primary/20 text-primary"
                        : ""
                  }`}
                >
                  {day.dayNumber}
                </button>
              </div>

              <div
                className={`min-h-[100px] p-1 rounded border bg-muted/10 space-y-1 transition-all ${
                  isActiveDay ? "ring-2 ring-primary/20 bg-primary/5" : ""
                }`}
              >
                {isLoading ? (
                  // Loading skeleton
                  <div className="space-y-1">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-6 bg-muted/40 rounded animate-pulse"
                      />
                    ))}
                  </div>
                ) : (
                  <>
                    {day.events.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className={`p-1 text-xs rounded cursor-pointer transition-colors ${
                          event.priority === "high"
                            ? "bg-green-500/20 text-green-700 dark:text-green-300 hover:bg-green-500/30"
                            : event.priority === "medium"
                              ? "bg-purple-500/20 text-purple-700 dark:text-purple-300 hover:bg-purple-500/30"
                              : "bg-muted/40 hover:bg-muted/60"
                        } ${event.completed ? "opacity-60 line-through" : ""}`}
                        onClick={() => {
                          // TODO: Open event details modal
                          console.log("Event clicked:", event);
                        }}
                      >
                        {event.title}
                      </div>
                    ))}

                    {/* Add button for empty slots */}
                    {day.events.length < 2 && (
                      <button
                        onClick={() => handleAddEvent(day.date)}
                        disabled={addEventMutation.isPending}
                        className={`flex items-center justify-center h-6 w-full border-2 border-dashed border-muted-foreground/30 rounded hover:border-muted-foreground/50 transition-colors ${
                          addEventMutation.isPending ? "opacity-50" : ""
                        }`}
                      >
                        <Plus className="w-3 h-3 text-muted-foreground/50" />
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Active day indicator */}
              {isActiveDay && (
                <div className="text-center">
                  <div className="w-2 h-2 bg-primary rounded-full mx-auto" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Week navigation info */}
      <div className="flex justify-center mt-3 text-xs text-muted-foreground">
        <span>
          {format(weekData[0].date, "MMM d")} -{" "}
          {format(weekData[6].date, "MMM d, yyyy")}
        </span>
      </div>
    </div>
  );
}

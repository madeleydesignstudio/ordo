"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addDays, format, startOfToday, subDays } from "date-fns";

import { cn } from "../../../lib/utils";
import { Button } from "../ui/button";

interface CalendarWeekProps {
  className?: string;
}

export function CalendarWeek({ className }: CalendarWeekProps) {
  const [centerDate, setCenterDate] = React.useState(startOfToday());

  // Generate week days
  const weekDays = React.useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(centerDate, i - 3);
      const dayName = format(date, "EEEE");
      const dayNumber = format(date, "dd");
      const isToday =
        format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

      return {
        date,
        dayName,
        dayNumber,
        isToday,
      };
    });
  }, [centerDate]);

  // Navigation handlers
  const previousDay = () => {
    setCenterDate((prev) => subDays(prev, 1));
  };

  const nextDay = () => {
    setCenterDate((prev) => addDays(prev, 1));
  };

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex">
        <Button
          variant="ghost"
          className="h-full w-12 p-0 hover:bg-muted"
          onClick={previousDay}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous day</span>
        </Button>
        <div className="flex flex-1">
          {weekDays.map((day) => (
            <div
              key={day.date.toISOString()}
              className={cn(
                "flex-1 border-x first:border-l-0 last:border-r-0",
                day.isToday && "bg-green-50"
              )}
            >
              <div className="p-2 text-center">
                <div className="text-sm font-medium text-muted-foreground">
                  {day.dayName}
                </div>
                {day.isToday && (
                  <div className="text-xs text-muted-foreground">Home</div>
                )}
                <div className="text-xs text-muted-foreground">
                  {day.dayNumber}
                </div>
              </div>
              <div className="h-32" />
            </div>
          ))}
        </div>
        <Button
          variant="ghost"
          className="h-full w-12 p-0 hover:bg-muted"
          onClick={nextDay}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next day</span>
        </Button>
      </div>
    </div>
  );
}

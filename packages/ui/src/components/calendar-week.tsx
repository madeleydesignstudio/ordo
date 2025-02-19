"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addDays, format, subDays } from "date-fns";

import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";

interface CalendarWeekProps {
  className?: string;
  onDateChange: (date: Date) => void;
  selectedDate: Date;
}

export function CalendarWeek({
  className,
  onDateChange,
  selectedDate,
}: CalendarWeekProps) {
  const [centerDate, setCenterDate] = React.useState(selectedDate);

  // Add this effect to update centerDate when selectedDate changes
  React.useEffect(() => {
    setCenterDate(selectedDate);
  }, [selectedDate]);

  // Call onDateChange whenever centerDate changes
  React.useEffect(() => {
    onDateChange(centerDate);
  }, [centerDate, onDateChange]);

  // Generate week days
  const weekDays = React.useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(centerDate, i - 3);
      const dayName = format(date, "EEEE");
      const dayNumber = format(date, "dd");
      const isToday = i === 3;

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
    <div className={cn("flex flex-col h-[160px]", className)}>
      <div className="flex h-full">
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
              <div className="p-2 text-center flex justify-between">
                <div className="text-sm font-medium text-[#6B9CA9]">
                  {day.dayName}
                </div>
                <div className="text-xs text-[#6B9CA9]">{day.dayNumber}</div>
              </div>
              <div className="h-20" />
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

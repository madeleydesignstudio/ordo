"use client";

import {
  format,
  isToday,
  isSameMonth,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
} from "date-fns";
import { Task } from "../../../../types/task";
import { TaskCalendarDay } from "./task-calendar-day";
import { cn } from "../../../../lib/utils";

interface TaskCalendarProps {
  tasks: Task[];
  currentDate: Date;
  onTaskUpdate: () => void;
}

export function TaskCalendar({
  tasks,
  currentDate,
  onTaskUpdate,
}: TaskCalendarProps) {
  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="grid grid-cols-7 gap-px border-b">
        {weekDays.map((day) => (
          <div
            key={day}
            className="bg-gray-50 p-2 text-center text-sm font-semibold text-gray-900"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {days.map((day, dayIdx) => {
          const dayTasks = tasks.filter(
            (task) => task.due_date && isSameDay(new Date(task.due_date), day)
          );

          return (
            <TaskCalendarDay
              key={day.toString()}
              date={day}
              tasks={dayTasks}
              isToday={isToday(day)}
              isCurrentMonth={isSameMonth(day, currentDate)}
              onTaskUpdate={onTaskUpdate}
            />
          );
        })}
      </div>
    </div>
  );
}

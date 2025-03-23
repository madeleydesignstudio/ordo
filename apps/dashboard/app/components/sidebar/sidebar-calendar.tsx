import { useState } from "react";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
} from "lucide-react";
import { useDate } from "@/components/date-context";

const SidebarCalendar = () => {
  const { currentDate, setCurrentDate } = useDate();

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const prevMonthDays = new Date(year, month, 0).getDate();
    return { daysInMonth, firstDayOfMonth, prevMonthDays };
  };

  const { daysInMonth, firstDayOfMonth, prevMonthDays } =
    getDaysInMonth(currentDate);

  // Calculate total cells needed for a complete 6x7 grid
  const totalCells = 6 * 7;
  const daysAfterMonth = totalCells - (firstDayOfMonth + daysInMonth);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    const today = new Date();
    return (
      currentDate.getDate() === day &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="p-2 text-neutral-300 w-full">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium">
          {currentDate.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </span>
        <div className="flex items-center justify-end mb-2">
          <button
            onClick={handlePrevMonth}
            className="p-1 hover:bg-neutral-700 rounded"
          >
            <ChevronUpIcon className="h-3 w-3" />
          </button>

          <button
            onClick={handleNextMonth}
            className="p-1 hover:bg-neutral-700 rounded"
          >
            <ChevronDownIcon className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-[2px] text-center text-[10px] mb-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div key={day} className="font-medium">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-[2px]">
        {/* Previous month days */}
        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div
            key={`prev-${index}`}
            className="h-[24px] w-[24px] flex items-center justify-center text-[10px] text-neutral-600"
          >
            {prevMonthDays - firstDayOfMonth + index + 1}
          </div>
        ))}

        {/* Current month days */}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          return (
            <button
              key={day}
              onClick={() =>
                setCurrentDate(
                  new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth(),
                    day
                  )
                )
              }
              className={`text-[10px] h-[24px] w-[24px] rounded hover:bg-neutral-700 flex items-center justify-center ${
                isToday(day) ? "bg-neutral-600" : ""
              } ${isSelected(day) ? "bg-neutral-500" : ""}`}
            >
              {day}
            </button>
          );
        })}

        {/* Next month days */}
        {Array.from({ length: daysAfterMonth }).map((_, index) => (
          <div
            key={`next-${index}`}
            className="h-[24px] w-[24px] flex items-center justify-center text-[10px] text-neutral-600"
          >
            {index + 1}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SidebarCalendar;

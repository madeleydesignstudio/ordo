import React from "react";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TodayButtonProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

const TodayButton = ({ currentDate, onDateChange }: TodayButtonProps) => {
  const goToToday = () => onDateChange(new Date());
  const goToPreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 1);
    onDateChange(newDate);
  };
  const goToNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 1);
    onDateChange(newDate);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={goToPreviousDay}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <h1
        className="text-center text-xs text-neutral-300 cursor-pointer"
        onClick={goToToday}
      >
        Today
      </h1>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={goToNextDay}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default TodayButton;

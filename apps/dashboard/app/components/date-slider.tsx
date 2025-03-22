import { useState, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { dummyTasks, type Task } from "@/data/tasks";

interface DateSliderProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

const DateSlider = ({ currentDate, onDateChange }: DateSliderProps) => {
  const [dates, setDates] = useState<Date[]>([]);

  // Helper function to get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    return dummyTasks.filter(
      (task) => task.date.toDateString() === date.toDateString()
    );
  };

  // Helper function to get priority color
  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "low":
        return "bg-green-500";
      case "medium":
        return "bg-yellow-500";
      case "high":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const updateDateRange = (center: Date) => {
    const dateArray: Date[] = [];
    for (let i = -3; i < 4; i++) {
      const date = new Date(center);
      date.setDate(center.getDate() + i);
      dateArray.push(date);
    }
    setDates(dateArray);
  };

  useEffect(() => {
    updateDateRange(currentDate);
  }, [currentDate]);

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 1);
    onDateChange(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 1);
    onDateChange(newDate);
  };

  const formatDate = (date: Date) => {
    return {
      day: date.toLocaleDateString("en-US", { weekday: "long" }),
      date: date.getDate(),
      isSelected: date.toDateString() === currentDate.toDateString(),
      isToday: date.toDateString() === new Date().toDateString(),
    };
  };

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex justify-center items-center w-full h-full">
        {dates.map((date, index) => {
          const { day, date: dateNum, isSelected, isToday } = formatDate(date);
          const tasksForDate = getTasksForDate(date);

          return (
            <div
              key={date.toISOString()}
              onClick={() => onDateChange(date)}
              className={`flex flex-col w-full text-neutral-300 h-full min-w-[120px] max-h-[200px] cursor-pointer
                ${isSelected ? "bg-neutral-600/50" : ""}
                ${isToday ? "bg-purple-800/50" : ""}
                ${index === dates.length - 1 ? "" : "border-r"} 
                border-neutral-600
                ${isSelected && isToday ? "bg-purple-800/50" : ""}`}
            >
              <div className="flex justify-between px-1 font-bold">
                <span className="text-sm uppercase">{day}</span>
                <span className="text-sm">{dateNum}</span>
              </div>
              <div className="flex-1 overflow-y-auto">
                {tasksForDate.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-2 text-xs p-2 bg-neutral-800 m-2 rounded-md hover:bg-neutral-700 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      className="h-3 w-3 rounded border-neutral-600 bg-neutral-900 checked:bg-blue-500"
                    />
                    <h3 className="flex-1">{task.title}</h3>
                    <span
                      className={`h-2 w-2 rounded-full ${getPriorityColor(task.priority)}`}
                      title={`${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} priority`}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="absolute bottom-2">
        <button onClick={handlePrevious} className="text-neutral-400">
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
      </div>
      <div className="absolute bottom-2 right-3">
        <button onClick={handleNext} className="text-neutral-400">
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default DateSlider;

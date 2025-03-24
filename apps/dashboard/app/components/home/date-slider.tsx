import { useState, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { dummyTasks, type Task } from "@/data/tasks";

interface DateSliderProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

const DateSlider = ({ currentDate, onDateChange }: DateSliderProps) => {
  const [dates, setDates] = useState<Date[]>([]);
  const [tasksByDate, setTasksByDate] = useState<Record<string, Task[]>>({});
  const [visibleRange, setVisibleRange] = useState({ start: -3, end: 3 });

  const updateDateRange = (center: Date) => {
    const dateArray: Date[] = [];
    // Fetch 20 days, but only show 7 at a time
    for (let i = -10; i < 10; i++) {
      const date = new Date(center);
      date.setDate(center.getDate() + i);
      dateArray.push(date);
    }
    setDates(dateArray);
  };

  // Initialize tasks for the entire date range
  useEffect(() => {
    const newTasksByDate: Record<string, Task[]> = {};
    dates.forEach((date) => {
      const dateString = date.toDateString();
      if (!tasksByDate[dateString]) {
        newTasksByDate[dateString] = dummyTasks.filter(
          (task) => task.date.toDateString() === dateString
        );
      }
    });
    setTasksByDate((prev) => ({ ...prev, ...newTasksByDate }));
  }, [dates]);

  // Replace getTasksForDate with memoized version
  const getTasksForDate = (date: Date) => {
    return tasksByDate[date.toDateString()] || [];
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

  useEffect(() => {
    updateDateRange(currentDate);
  }, [currentDate]);

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 1);
    onDateChange(newDate);

    // If we're getting close to the start of our range, fetch more dates
    const currentIndex = dates.findIndex(
      (date) => date.toDateString() === newDate.toDateString()
    );
    if (currentIndex < 5) {
      const earliestDate = new Date(dates[0]);
      const dateArray = [...dates];
      for (let i = 1; i <= 10; i++) {
        const date = new Date(earliestDate);
        date.setDate(earliestDate.getDate() - i);
        dateArray.unshift(date);
      }
      setDates(dateArray.slice(0, 20)); // Keep only 20 days
    }
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 1);
    onDateChange(newDate);

    // If we're getting close to the end of our range, fetch more dates
    const currentIndex = dates.findIndex(
      (date) => date.toDateString() === newDate.toDateString()
    );
    if (currentIndex > dates.length - 5) {
      const latestDate = new Date(dates[dates.length - 1]);
      const dateArray = [...dates];
      for (let i = 1; i <= 10; i++) {
        const date = new Date(latestDate);
        date.setDate(latestDate.getDate() + i);
        dateArray.push(date);
      }
      setDates(dateArray.slice(-20)); // Keep only 20 days
    }
  };

  // Get the visible dates (7 days centered around current date)
  const visibleDates = dates.slice(
    dates.findIndex(
      (date) => date.toDateString() === currentDate.toDateString()
    ) + visibleRange.start,
    dates.findIndex(
      (date) => date.toDateString() === currentDate.toDateString()
    ) +
      visibleRange.end +
      1
  );

  const formatDate = (date: Date) => {
    return {
      day: date.toLocaleDateString("en-US", { weekday: "long" }),
      date: date.getDate(),
      isSelected: date.toDateString() === currentDate.toDateString(),
      isToday: date.toDateString() === new Date().toDateString(),
    };
  };

  return (
    <div className="h-[15%] border-t border-neutral-600 w-full">
      <div className="flex flex-col w-full h-full">
        <div className="flex justify-center items-center w-full h-full">
          {visibleDates.map((date, index) => {
            const {
              day,
              date: dateNum,
              isSelected,
              isToday,
            } = formatDate(date);
            const tasksForDate = getTasksForDate(date);

            return (
              <div
                key={date.toISOString()}
                onClick={() => onDateChange(date)}
                className={`flex flex-col w-full text-neutral-300 h-full min-w-[120px] max-h-[200px] cursor-pointer
              ${isSelected ? "bg-neutral-600/50" : ""}
              ${isToday ? "bg-purple-800/30" : ""}
              ${index === visibleDates.length - 1 ? "" : "border-r"} 
              border-neutral-600
              ${isSelected && isToday ? "bg-purple-800/30" : ""}`}
              >
                <div className="flex justify-between p-1 font-bold">
                  <span className="text-xs uppercase">{day}</span>
                  <span className="text-xs">{dateNum}</span>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {tasksForDate.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-2 text-[10px] p-2 bg-neutral-800 m-2 rounded-md hover:bg-neutral-700 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        className="h-2 w-2 rounded border-neutral-600 bg-neutral-900 checked:bg-blue-500"
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
    </div>
  );
};

export default DateSlider;

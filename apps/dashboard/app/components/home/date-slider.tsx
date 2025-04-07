import { useState, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

interface DateSliderProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

type Task = {
  id: number;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  projectId: number;
  project?: {
    id: number;
    name: string;
  };
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
};

const DateSlider = ({ currentDate, onDateChange }: DateSliderProps) => {
  const [dates, setDates] = useState<Date[]>([]);
  const [visibleRange, setVisibleRange] = useState({ start: -3, end: 3 });
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const updateDateRange = (center: Date) => {
    const dateArray: Date[] = [];
    // Fetch 24 days (12 before and 12 after the current date)
    for (let i = -12; i < 12; i++) {
      const date = new Date(center);
      date.setDate(center.getDate() + i);
      dateArray.push(date);
    }
    setDates(dateArray);

    // Set date range for API query
    const startDate = new Date(dateArray[0]);
    const endDate = new Date(dateArray[dateArray.length - 1]);

    setDateRange({
      start: startDate.toISOString().split("T")[0],
      end: endDate.toISOString().split("T")[0],
    });
  };

  useEffect(() => {
    updateDateRange(currentDate);
    setIsInitialLoad(false);
  }, [currentDate]);

  // Fetch tasks for the date range
  const { data: tasksData, isLoading: tasksLoading } = useQuery<{
    tasks: Task[];
  }>({
    queryKey: ["tasks-by-date", dateRange.start, dateRange.end],
    queryFn: async () => {
      if (!dateRange.start || !dateRange.end) return { tasks: [] };

      const response = await fetch(
        `/api/tasks/by-date?startDate=${dateRange.start}&endDate=${dateRange.end}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }

      return response.json();
    },
    enabled: !!dateRange.start && !!dateRange.end,
    // Keep the data in cache for 5 minutes to prevent unnecessary refetches
    staleTime: 5 * 60 * 1000,
    // Don't refetch on window focus to prevent flashing
    refetchOnWindowFocus: false,
  });

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
      for (let i = 1; i <= 12; i++) {
        const date = new Date(earliestDate);
        date.setDate(earliestDate.getDate() - i);
        dateArray.unshift(date);
      }
      setDates(dateArray.slice(0, 24)); // Keep only 24 days

      // Update date range for API query
      const startDate = new Date(dateArray[0]);
      const endDate = new Date(dateArray[dateArray.length - 1]);

      setDateRange({
        start: startDate.toISOString().split("T")[0],
        end: endDate.toISOString().split("T")[0],
      });
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
      for (let i = 1; i <= 12; i++) {
        const date = new Date(latestDate);
        date.setDate(latestDate.getDate() + i);
        dateArray.push(date);
      }
      setDates(dateArray.slice(-24)); // Keep only 24 days

      // Update date range for API query
      const startDate = new Date(dateArray[0]);
      const endDate = new Date(dateArray[dateArray.length - 1]);

      setDateRange({
        start: startDate.toISOString().split("T")[0],
        end: endDate.toISOString().split("T")[0],
      });
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

  // Get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    if (!tasksData?.tasks) return [];

    const dateString = date.toISOString().split("T")[0];
    return tasksData.tasks.filter((task) => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate).toISOString().split("T")[0];
      return taskDate === dateString;
    });
  };

  // Get priority color class
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-gray-200 text-gray-700";
      case "medium":
        return "bg-blue-200 text-blue-700";
      case "high":
        return "bg-orange-200 text-orange-700";
      case "urgent":
        return "bg-red-200 text-red-700";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  // Debug function to log tasks data
  useEffect(() => {
    if (tasksData) {
      console.log("Tasks data:", tasksData);
      console.log("Date range:", dateRange);

      // Log tasks for today
      const today = new Date();
      const todayTasks = getTasksForDate(today);
      console.log("Today's tasks:", todayTasks);

      // Log tasks for tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowTasks = getTasksForDate(tomorrow);
      console.log("Tomorrow's tasks:", tomorrowTasks);
    }
  }, [tasksData, dateRange]);

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

            const dateTasks = getTasksForDate(date);

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
                <div className="flex-1 overflow-y-auto p-1">
                  {isInitialLoad && tasksLoading ? (
                    <div className="text-xs text-neutral-500">Loading...</div>
                  ) : dateTasks.length > 0 ? (
                    <div className="space-y-1">
                      {dateTasks.map((task) => (
                        <Link
                          key={task.id}
                          to="/project-manager/task/$taskId"
                          params={{ taskId: task.id.toString() }}
                          onClick={(e) => e.stopPropagation()}
                          className="block text-xs p-1 rounded hover:bg-neutral-700/50"
                        >
                          <div className="flex items-center gap-1">
                            <span
                              className={`px-1 py-0.5 rounded-full text-[10px] ${getPriorityColor(task.priority)}`}
                            >
                              {task.priority}
                            </span>
                            <span className="truncate">{task.title}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-neutral-500 italic">
                      No tasks
                    </div>
                  )}
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

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useEffect, useState, useMemo } from "react";

interface DateSliderProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

// Define Task type based on your schema
type Task = {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done';
  dueDate: string | null; // API likely returns ISO string
  projectId: string | null;
  createdAt: string;
  updatedAt: string;
};

const DateSlider = ({ currentDate, onDateChange }: DateSliderProps) => {
  const [dates, setDates] = useState<Date[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([])
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [taskError, setTaskError] = useState<string | null>(null);

  // Function to format date to YYYY-MM-DD for comparison and API
  const formatDateToISO = (date: Date | null | undefined): string => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  const updateDateRange = (center: Date) => {
    const dateArray: Date[] = [];
    // Pre-fetch a wider range to make navigation smoother
    for (let i = -10; i < 10; i++) { // Fetch 20 days
      const date = new Date(center);
      date.setDate(center.getDate() + i);
      dateArray.push(date);
    }
    setDates(dateArray);
  };

  useEffect(() => {
    updateDateRange(currentDate);
  }, [currentDate]); // Rerun when the central date changes

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 1);
    onDateChange(newDate);
    
    // Pre-fetching logic (simplified, relies on updateDateRange re-running)
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 1);
    onDateChange(newDate);
    
    // Pre-fetching logic (simplified, relies on updateDateRange re-running)
  };

  // Calculate visible dates (memoized)
  const visibleDates = useMemo(() => {
    if (dates.length === 0) return [];
    
    const centerIndex = dates.findIndex(
      (d) => formatDateToISO(d) === formatDateToISO(currentDate)
    );

    if (centerIndex === -1) return []; // Should not happen if updateDateRange runs correctly

    let startIndex = Math.max(0, centerIndex - 3);
    let endIndex = Math.min(dates.length, startIndex + 7); // Ensure we don't exceed bounds

    // Adjust if we are near the end and don't have 7 dates
    if (endIndex - startIndex < 7 && dates.length >= 7) {
        startIndex = Math.max(0, dates.length - 7);
        endIndex = dates.length;
    }

    return dates.slice(startIndex, endIndex);
  }, [dates, currentDate]);

  // Fetch tasks when visibleDates change
  useEffect(() => {
    if (visibleDates.length === 0) return;

    const fetchTasksForRange = async () => {
      setIsLoadingTasks(true);
      setTaskError(null);
      const startDate = formatDateToISO(visibleDates[0]);
      const endDate = formatDateToISO(visibleDates[visibleDates.length - 1]);
      
      try {
        // Construct URL with query params
        const apiUrl = `/api/tasks?startDate=${startDate}&endDate=${endDate}`;
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`HTTP error fetching tasks! status: ${response.status}`);
        }
        const tasksData: Task[] = await response.json();
        setAllTasks(tasksData);
      } catch (e) {
        setTaskError(e instanceof Error ? e.message : 'Failed to fetch tasks');
        console.error('Fetch tasks error:', e);
        setAllTasks([]); // Clear tasks on error
      } finally {
        setIsLoadingTasks(false);
      }
    };

    fetchTasksForRange();
  }, [visibleDates]); // Dependency array includes visibleDates


  const formatDate = (date: Date) => {
    return {
      day: date.toLocaleDateString("en-US", { weekday: "short" }), // Use short day name
      date: date.getDate(),
      fullDateStr: formatDateToISO(date), // YYYY-MM-DD string for filtering
      isSelected: formatDateToISO(date) === formatDateToISO(currentDate),
      isToday: formatDateToISO(date) === formatDateToISO(new Date()),
    };
  };

  return (
    <div className="relative h-[15%] border-t border-neutral-600 w-full">
      <div className="flex flex-col w-full h-full">
        <div className="flex justify-center items-stretch w-full h-full"> {/* Use items-stretch */} 
          {visibleDates.map((date, index) => {
            const {
              day,
              date: dateNum,
              fullDateStr,
              isSelected,
              isToday,
            } = formatDate(date);

            // Filter tasks for the current date, limit to 3
            const tasksForDate = allTasks
              .filter(task => task.dueDate && formatDateToISO(new Date(task.dueDate)) === fullDateStr)
              .slice(0, 3);

            return (
              <div
                key={fullDateStr} // Use YYYY-MM-DD string as key
                onClick={() => onDateChange(date)}
                className={`flex flex-col w-full text-neutral-300 h-full min-w-[120px] max-h-[200px] cursor-pointer 
                ${isSelected ? "bg-neutral-700/60" : "hover:bg-neutral-800/30"} 
                ${isToday ? "border-t-2 border-purple-600" : ""} 
                ${index === visibleDates.length - 1 ? "" : "border-r"} 
                border-neutral-600 
                transition-colors duration-150 ease-in-out`}
              >
                <div className="flex justify-between p-1 px-2 font-semibold border-b border-neutral-700/50">
                  <span className={`text-xs uppercase ${isToday ? 'text-purple-400' : 'text-neutral-400'}`}>{day}</span>
                  <span className={`text-sm ${isSelected ? 'text-white' : 'text-neutral-300'}`}>{dateNum}</span>
                </div>
                <div className="flex-1 overflow-y-auto p-1 space-y-1">
                  {/* Render max 3 tasks */} 
                  {isLoadingTasks && index === 0 && <span className="text-xs text-neutral-500">Loading...</span>} 
                  {taskError && index === 0 && <span className="text-xs text-red-500">Error</span>} 
                  {tasksForDate.length > 0 ? (
                    tasksForDate.map(task => (
                       <div key={task.id} className="text-xs bg-neutral-700/50 p-1 rounded truncate" title={task.title}>
                         {task.title}
                       </div>
                    ))
                  ) : (
                    // No tasks for this day - div remains empty 
                    null 
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button onClick={handlePrevious} className="absolute bottom-2 left-1 text-neutral-400 hover:text-white p-1 rounded-full bg-neutral-800/50 hover:bg-neutral-700/70 transition-colors">
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
        <button onClick={handleNext} className="absolute bottom-2 right-1 text-neutral-400 hover:text-white p-1 rounded-full bg-neutral-800/50 hover:bg-neutral-700/70 transition-colors">
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default DateSlider;

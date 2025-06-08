import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface DateSliderProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  tasks?: Task[];
}

// Define Task type based on your schema
type Task = {
  id: string;
  name: string;
  description: string | null;
  status: 'backlog' | 'todo' | 'in_progress' | 'done' | 'on_hold';
  dueDate: string | null;
  startDate: string | null;
  projectId: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  labels: string[] | null;
  parentTaskId?: string | null;
  createdAt: string;
  updatedAt: string;
};

const DateSlider = ({ currentDate, onDateChange, tasks = [] }: DateSliderProps) => {
  const [dates, setDates] = useState<Date[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [taskError, setTaskError] = useState<string | null>(null);

  // Function to format date to YYYY-MM-DD for comparison and API
  const formatDateToISO = (date: Date | null | undefined): string => {
    if (!date) return '';
    return date.toISOString().split('T')[0] || '';
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
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 1);
    onDateChange(newDate);
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
    <div className="relative h-full border-t border-stone-300 w-full">
      {/* Navigation buttons positioned absolutely */}
      <button 
        onClick={handlePrevious} 
        className="absolute bottom-0 -translate-y-1/2 left-4 text-stone-600 hover:text-stone-900 p-2 rounded-full bg-white shadow-md hover:bg-stone-100 transition-colors border border-stone-200 z-10"
        aria-label="Previous day"
      >
        <ChevronLeftIcon className="h-5 w-5" />
      </button>
      
      <button 
        onClick={handleNext} 
        className="absolute bottom-0 -translate-y-1/2 right-4 text-stone-600 hover:text-stone-900 p-2 rounded-full bg-white shadow-md hover:bg-stone-100 transition-colors border border-stone-200 z-10"
        aria-label="Next day"
      >
        <ChevronRightIcon className="h-5 w-5" />
      </button>

      <div className="flex flex-col w-full h-full">
        <div className="flex justify-center items-stretch w-full h-full"> 
          {visibleDates.map((date, index) => {
            const {
              day,
              date: dateNum,
              fullDateStr,
              isSelected,
              isToday,
            } = formatDate(date);

            // Filter tasks for the current date, limit to 3
            const tasksForDate = tasks
              .filter(task => task.dueDate && formatDateToISO(new Date(task.dueDate)) === fullDateStr)
              .slice(0, 3);

            return (
              <div
                key={fullDateStr} // Use YYYY-MM-DD string as key
                onClick={() => onDateChange(date)}
                className={`flex flex-col w-full text-neutral-300 h-full min-w-[120px] max-h-[200px] cursor-pointer 
                ${isSelected ? "bg-stone-700/60" : "hover:bg-stone-800/30"} 
                ${isToday ? "border-t-2 border-purple-600" : ""} 
                ${index === visibleDates.length - 1 ? "" : "border-r"} 
                border-stone-300 
                transition-colors duration-150 ease-in-out`}
              >
                <div className="flex justify-between p-1 px-2 font-semibold border-b border-stone-300">
                  <span className={`text-xs uppercase ${isToday ? 'text-purple-400' : 'text-stone-400'}`}>{day}</span>
                  <span className={`text-sm ${isSelected ? 'text-white' : 'text-stone-300'}`}>{dateNum}</span>
                </div>
                <div className="flex-1 overflow-y-auto p-1 space-y-1">
                  {isLoadingTasks && index === 0 && <span className="text-xs text-stone-500">Loading...</span>} 
                  {taskError && index === 0 && <span className="text-xs text-red-500">Error</span>} 
                  {tasksForDate.length > 0 ? (
                    tasksForDate.map(task => (
                       <div 
                         key={task.id} 
                         className={`text-xs p-1 rounded truncate ${
                           task.priority === 'urgent' ? 'bg-red-100 text-red-900' :
                           task.priority === 'high' ? 'bg-orange-100 text-orange-900' :
                           task.priority === 'medium' ? 'bg-blue-100 text-blue-900' :
                           'bg-stone-200 text-stone-800'
                         }`}
                         title={task.name}
                       >
                         {task.name}
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
      </div>
    </div>
  );
};

export default DateSlider;

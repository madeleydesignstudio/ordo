import React, { useState } from "react";
import { ProjectData } from "../project-layout";

interface ProjectCalendarViewProps {
  data?: ProjectData;
}

const ProjectCalendarView: React.FC<ProjectCalendarViewProps> = ({ data }) => {
  const tasks = data?.tasks || [];
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Get the first day of the month and the number of days in the month
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  
  // Get the day of the week of the first day (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfWeek = firstDayOfMonth.getDay();
  
  // Array of month names for header
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  // Generate calendar days
  const calendarDays = [];
  
  // Add empty cells for days before the first of the month
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }
  
  // Get tasks for a specific day
  const getTasksForDay = (day: number) => {
    if (!day) return [];
    
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateString = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate).toISOString().split('T')[0];
      return taskDate === dateString;
    });
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Calendar View</h2>
        <div className="flex items-center space-x-2">
          <button 
            onClick={goToPreviousMonth}
            className="p-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-400 cursor-pointer"
          >
            &lt;
          </button>
          <span className="text-lg font-medium">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button 
            onClick={goToNextMonth}
            className="p-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-400 cursor-pointer"
          >
            &gt;
          </button>
        </div>
      </div>
      
      <div className="border border-neutral-700 rounded-md bg-neutral-900/50">
        {/* Calendar header - days of the week */}
        <div className="grid grid-cols-7 border-b border-neutral-700">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
            <div 
              key={index} 
              className="p-2 text-center font-medium text-neutral-400 text-sm"
            >
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            const dayTasks = day ? getTasksForDay(day) : [];
            const isToday = day && 
              currentDate.getMonth() === new Date().getMonth() && 
              currentDate.getFullYear() === new Date().getFullYear() && 
              day === new Date().getDate();
            
            return (
              <div 
                key={index} 
                className={`min-h-[100px] p-1 border-r border-b border-neutral-700 relative ${
                  !day ? 'bg-neutral-900/80' : ''
                } ${
                  isToday ? 'bg-blue-900/10' : ''
                }`}
              >
                {day && (
                  <>
                    <div className={`text-right p-1 ${
                      isToday ? 'bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center ml-auto' : 'text-neutral-400'
                    }`}>
                      {day}
                    </div>
                    <div className="mt-1 space-y-1 overflow-y-auto max-h-[70px]">
                      {dayTasks.map(task => (
                        <div 
                          key={task.id} 
                          className={`text-xs p-1 rounded ${
                            task.status === 'todo' ? 'bg-blue-900/30 text-blue-300' :
                            task.status === 'in_progress' ? 'bg-yellow-900/30 text-yellow-300' :
                            task.status === 'done' ? 'bg-green-900/30 text-green-300' :
                            'bg-neutral-800 text-neutral-300'
                          } truncate cursor-pointer`}
                          title={task.title}
                        >
                          {task.title}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProjectCalendarView; 
'use client';

import { Calendar, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../button';

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  startDate?: Date | null;
  dueDate?: Date | null;
  icon?: string;
  cover?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  parentProjectId?: string | null;
}

interface CalendarViewProps {
  projects: Project[];
}

// Status mapping to colors
const statusColors: Record<string, string> = {
  'backlog': '#6B7280', // Gray
  'todo': '#3B82F6',    // Blue
  'in_progress': '#F59E0B', // Amber
  'done': '#10B981',    // Emerald
  'on_hold': '#EF4444', // Red
};

const CalendarView = ({ projects = [] }: CalendarViewProps) => {
  // Get current date
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  
  // Calendar navigation
  const prevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };
  
  const nextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  // Generate calendar data
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDay.getDay();
    
    // Total days in the month
    const daysInMonth = lastDay.getDate();
    
    // Array to hold all calendar cells
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ day: null, date: null });
    }
    
    // Add cells for all days in the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({ day, date });
    }
    
    return days;
  };
  
  // Get projects for a specific date
  const getProjectsForDate = (date: Date | null) => {
    if (!date) return [];
    
    return projects.filter(project => {
      // Check if the project has start and end dates
      if (!project.startDate && !project.dueDate) return false;
      
      const projectStart = project.startDate ? new Date(project.startDate) : null;
      const projectEnd = project.dueDate ? new Date(project.dueDate) : null;
      
      // If project has only a start date, check if it's on this day
      if (projectStart && !projectEnd) {
        return isSameDay(projectStart, date);
      }
      
      // If project has only an end date, check if it's on this day
      if (!projectStart && projectEnd) {
        return isSameDay(projectEnd, date);
      }
      
      // If project has both dates, check if this day falls within the range
      if (projectStart && projectEnd) {
        return isDateInRange(date, projectStart, projectEnd);
      }
      
      return false;
    });
  };
  
  // Helper functions
  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };
  
  const isDateInRange = (date: Date, start: Date, end: Date) => {
    const time = date.getTime();
    return time >= start.getTime() && time <= end.getTime();
  };
  
  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return isSameDay(date, today);
  };
  
  // Format month and year for display
  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };
  
  // Generate days of the week headers
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Get calendar days
  const calendarDays = generateCalendarDays();
  
  return (
    <div className="calendar-view">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-stone-500" />
          <h2 className="text-xl font-semibold">{formatMonthYear(currentDate)}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Calendar Grid */}
      <div className="border rounded-lg overflow-hidden bg-white">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 bg-stone-100">
          {daysOfWeek.map(day => (
            <div key={day} className="py-2 text-center text-sm font-medium text-stone-500">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Cells */}
        <div className="grid grid-cols-7 border-t">
          {calendarDays.map((dayObj, index) => {
            const { day, date } = dayObj;
            const dayProjects = date ? getProjectsForDate(date) : [];
            const hasProjects = dayProjects.length > 0;
            
            return (
              <div 
                key={index} 
                className={`min-h-24 p-2 border-b border-r relative ${
                  !day ? 'bg-stone-50' : isToday(date) ? 'bg-blue-50' : ''
                }`}
              >
                {day && (
                  <>
                    <div className={`text-sm font-medium ${isToday(date) ? 'text-blue-600' : ''}`}>
                      {day}
                    </div>
                    
                    {/* Project indicators */}
                    <div className="mt-1 space-y-1 max-h-20 overflow-y-auto">
                      {dayProjects.slice(0, 3).map(project => (
                        <div 
                          key={project.id}
                          className="text-xs py-1 px-2 rounded truncate cursor-pointer hover:opacity-80"
                          style={{ 
                            backgroundColor: statusColors[project.status] || '#6B7280',
                            color: 'white'
                          }}
                          onMouseEnter={() => setShowTooltip(project.id)}
                          onMouseLeave={() => setShowTooltip(null)}
                        >
                          {project.name}
                          
                          {/* Tooltip */}
                          {showTooltip === project.id && (
                            <div className="absolute z-10 w-64 p-2 bg-white border rounded shadow-lg left-full ml-2">
                              <div className="flex items-start gap-2">
                                <div className="text-base">{project.icon || '📁'}</div>
                                <div>
                                  <h4 className="font-medium text-sm">{project.name}</h4>
                                  {project.description && (
                                    <p className="text-xs text-stone-500 mt-1">{project.description}</p>
                                  )}
                                  <div className="flex flex-col mt-1">
                                    {project.startDate && (
                                      <span className="text-xs text-stone-500">
                                        Start: {new Date(project.startDate).toLocaleDateString()}
                                      </span>
                                    )}
                                    {project.dueDate && (
                                      <span className="text-xs text-stone-500">
                                        Due: {new Date(project.dueDate).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {/* Indicator for more projects */}
                      {dayProjects.length > 3 && (
                        <div className="text-xs text-stone-500 flex items-center">
                          <Info className="h-3 w-3 mr-1" />
                          {dayProjects.length - 3} more
                        </div>
                      )}
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

export default CalendarView;
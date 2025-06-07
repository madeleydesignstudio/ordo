'use client';

import {
  ChevronLeft,
  ChevronRight,
  Clock,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { useEffect, useState } from 'react';
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

interface GanttViewProps {
  projects: Project[];
}

// Status mapping to colors
const statusColors: Record<string, string> = {
  'backlog': '#6B7280',   // Gray
  'todo': '#3B82F6',      // Blue
  'in_progress': '#F59E0B', // Amber
  'done': '#10B981',      // Emerald
  'on_hold': '#EF4444',   // Red
};

// Status labels
const statusLabels: Record<string, string> = {
  'backlog': 'Backlog',
  'todo': 'To Do',
  'in_progress': 'In Progress',
  'done': 'Done',
  'on_hold': 'On Hold',
};

const GanttView = ({ projects = [] }: GanttViewProps) => {
  // Only include projects with dates
  const validProjects = projects.filter(p => p.startDate || p.dueDate);
  
  // State
  const [dateRange, setDateRange] = useState<{ start: Date, end: Date }>({
    start: new Date(),
    end: new Date(),
  });
  const [zoom, setZoom] = useState(1); // 1 = day, 2 = week, 3 = month
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  
  // Calculate the date range based on projects
  useEffect(() => {
    if (validProjects.length === 0) {
      // Default to current month if no projects with dates
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setDateRange({ start, end });
      return;
    }
    
    // Find earliest start date and latest end date
    let earliestDate: Date | null = null;
    let latestDate: Date | null = null;
    
    validProjects.forEach(project => {
      const startDate = project.startDate ? new Date(project.startDate) : null;
      const dueDate = project.dueDate ? new Date(project.dueDate) : null;
      
      if (startDate) {
        if (!earliestDate || startDate < earliestDate) {
          earliestDate = startDate;
        }
      }
      
      if (dueDate) {
        if (!latestDate || dueDate > latestDate) {
          latestDate = dueDate;
        }
      }
    });
    
    // Add padding to range
    if (earliestDate && latestDate) {
      const earliestPadded = new Date(earliestDate);
      earliestPadded.setDate(earliestPadded.getDate() - 5);
      
      const latestPadded = new Date(latestDate);
      latestPadded.setDate(latestPadded.getDate() + 5);
      
      setDateRange({ start: earliestPadded, end: latestPadded });
    }
  }, [validProjects]);
  
  // Navigation handlers
  const zoomIn = () => setZoom(prev => Math.min(prev + 1, 3));
  const zoomOut = () => setZoom(prev => Math.max(prev - 1, 1));
  
  const moveLeft = () => {
    const { start, end } = dateRange;
    const range = end.getTime() - start.getTime();
    const newStart = new Date(start.getTime() - range / 2);
    const newEnd = new Date(end.getTime() - range / 2);
    setDateRange({ start: newStart, end: newEnd });
  };
  
  const moveRight = () => {
    const { start, end } = dateRange;
    const range = end.getTime() - start.getTime();
    const newStart = new Date(start.getTime() + range / 2);
    const newEnd = new Date(end.getTime() + range / 2);
    setDateRange({ start: newStart, end: newEnd });
  };
  
  const resetView = () => {
    // Recalculate the date range
    if (validProjects.length === 0) {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setDateRange({ start, end });
    } else {
      let earliestDate: Date | null = null;
      let latestDate: Date | null = null;
      
      validProjects.forEach(project => {
        const startDate = project.startDate ? new Date(project.startDate) : null;
        const dueDate = project.dueDate ? new Date(project.dueDate) : null;
        
        if (startDate) {
          if (!earliestDate || startDate < earliestDate) {
            earliestDate = startDate;
          }
        }
        
        if (dueDate) {
          if (!latestDate || dueDate > latestDate) {
            latestDate = dueDate;
          }
        }
      });
      
      if (earliestDate && latestDate) {
        const earliestPadded = new Date(earliestDate);
        earliestPadded.setDate(earliestPadded.getDate() - 5);
        
        const latestPadded = new Date(latestDate);
        latestPadded.setDate(latestPadded.getDate() + 5);
        
        setDateRange({ start: earliestPadded, end: latestPadded });
      }
    }
    
    setZoom(1);
  };
  
  // Helper functions
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  const formatShortDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };
  
  // Generate time axis
  const generateTimeAxis = () => {
    const { start, end } = dateRange;
    const dayCount = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    let increment = 1; // Default to 1 day
    
    // Adjust based on zoom level
    if (zoom === 2) increment = 7; // Weekly
    if (zoom === 3) increment = 30; // Monthly
    
    const timePoints = [];
    
    for (let i = 0; i <= dayCount; i += increment) {
      const date = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
      timePoints.push(date);
    }
    
    return timePoints;
  };
  
  // Calculate position for a date
  const calculatePosition = (date: Date | null, defaultToStart = true) => {
    if (!date) return defaultToStart ? 0 : 100;
    
    const { start, end } = dateRange;
    const totalMs = end.getTime() - start.getTime();
    
    // If date is before range start, cap at start
    if (date.getTime() < start.getTime()) return 0;
    
    // If date is after range end, cap at end
    if (date.getTime() > end.getTime()) return 100;
    
    // Calculate percentage
    const position = ((date.getTime() - start.getTime()) / totalMs) * 100;
    return position;
  };
  
  // Sort projects by start date
  const sortedProjects = [...validProjects].sort((a, b) => {
    const aStart = a.startDate ? new Date(a.startDate).getTime() : 0;
    const bStart = b.startDate ? new Date(b.startDate).getTime() : 0;
    
    if (aStart === bStart) {
      // If start dates are the same, sort by name
      return a.name.localeCompare(b.name);
    }
    
    return aStart - bStart;
  });
  
  // Generate the time axis
  const timePoints = generateTimeAxis();
  
  // Calculate the current date marker position
  const today = new Date();
  const todayPosition = calculatePosition(today, false);
  const showTodayMarker = todayPosition >= 0 && todayPosition <= 100;
  
  return (
    <div className="gantt-view">
      {/* Gantt Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Clock className="h-5 w-5 mr-2 text-stone-500" />
          <h2 className="text-xl font-semibold">Gantt Timeline</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={moveLeft}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={resetView}>
            Reset
          </Button>
          <Button variant="outline" size="sm" onClick={moveRight}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={zoomOut} disabled={zoom === 1}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={zoomIn} disabled={zoom === 3}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Time range display */}
      <div className="text-sm text-stone-500 mb-4">
        <span className="font-medium">Time Range:</span> {formatDate(dateRange.start)} - {formatDate(dateRange.end)}
      </div>
      
      {/* Gantt Chart */}
      <div className="border rounded-lg overflow-hidden bg-white">
        {/* Time Axis */}
        <div className="relative border-b">
          <div className="flex h-10">
            {/* Left sidebar header */}
            <div className="w-1/4 min-w-60 border-r p-2 bg-stone-50 flex items-center">
              <span className="font-medium text-sm text-stone-700">Project Name</span>
            </div>
            
            {/* Time axis */}
            <div className="flex-1 relative">
              {timePoints.map((date, index) => (
                <div 
                  key={index} 
                  className="absolute top-0 bottom-0 flex flex-col items-center justify-center border-l"
                  style={{ left: `${calculatePosition(date)}%` }}
                >
                  <span className="text-xs text-stone-500">{formatShortDate(date)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Gantt Body */}
        <div className="relative">
          {sortedProjects.length === 0 ? (
            <div className="text-center p-10 text-stone-500">
              No projects with dates to display
            </div>
          ) : (
            <>
              {/* Project rows */}
              {sortedProjects.map((project, index) => {
                const startPos = calculatePosition(
                  project.startDate ? new Date(project.startDate) : null,
                  true
                );
                const endPos = calculatePosition(
                  project.dueDate ? new Date(project.dueDate) : null,
                  false
                );
                const width = endPos - startPos;
                
                return (
                  <div key={project.id} className="flex border-b hover:bg-stone-50">
                    {/* Project info */}
                    <div className="w-1/4 min-w-60 p-3 border-r flex items-center gap-2">
                      <span className="text-xl">{project.icon || '📁'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{project.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span 
                            className="px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{ 
                              backgroundColor: statusColors[project.status] || '#6B7280',
                              color: 'white'
                            }}
                          >
                            {statusLabels[project.status] || project.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Gantt bar */}
                    <div className="flex-1 h-16 relative">
                      {/* Bar */}
                      <div 
                        className="absolute top-0 bottom-0 flex items-center"
                        style={{ left: `${startPos}%`, width: `${width}%` }}
                      >
                        <div 
                          className="h-8 rounded-md w-full relative cursor-pointer hover:opacity-80"
                          style={{ backgroundColor: statusColors[project.status] || '#6B7280' }}
                          onMouseEnter={() => setShowTooltip(project.id)}
                          onMouseLeave={() => setShowTooltip(null)}
                        >
                          <div className="absolute inset-0 flex items-center px-2 text-white text-xs truncate">
                            {project.name}
                          </div>
                          
                          {/* Tooltip */}
                          {showTooltip === project.id && (
                            <div className="absolute z-10 w-64 p-2 bg-white border rounded shadow-lg top-full mt-1 left-0">
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
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Today marker */}
              {showTodayMarker && (
                <div 
                  className="absolute top-0 bottom-0 w-px bg-red-500 z-10"
                  style={{ left: `${todayPosition}%` }}
                >
                  <div className="absolute top-0 transform -translate-x-1/2 bg-red-500 text-white text-xs py-1 px-2 rounded">
                    Today
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4">
        <div className="text-sm text-stone-500">Status:</div>
        {Object.entries(statusLabels).map(([status, label]) => (
          <div key={status} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: statusColors[status] }}
            ></div>
            <span className="text-xs text-stone-700">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GanttView;
'use client';

import { useEffect, useState } from 'react';
import CalendarView from './calendar-view';
import GanttView from './gantt-view';
import KanbanView from './kanban-view';
import ListView from './list-view';
import TableView from './table-view';

export type ViewType = 'kanban' | 'list' | 'table' | 'calendar' | 'gantt' | 'classic';

interface ViewContainerProps {
  viewType: ViewType;
  data?: any[]; // This will be the data specific to the route (projects, tasks, notes)
  onStatusChange?: (itemId: string, newStatus: string) => Promise<void>;
}

/**
 * ViewContainer component that renders the appropriate view based on the selected view type
 * This passes the data to each view component for rendering
 */
const ViewContainer = ({ viewType: initialViewType, data = [], onStatusChange }: ViewContainerProps) => {
  // Keep internal state of the view type to respond to changes
  const [viewType, setViewType] = useState<ViewType>(initialViewType);
  
  // Update internal state when props change
  useEffect(() => {
    setViewType(initialViewType);
  }, [initialViewType]);
  
  // Listen for global view type changes
  useEffect(() => {
    const handleViewTypeChange = (event: CustomEvent) => {
      if (event.detail && event.detail.viewType) {
        setViewType(event.detail.viewType);
      }
    };
    
    // Add event listener
    window.addEventListener('viewTypeChanged', handleViewTypeChange as EventListener);
    
    // Clean up
    return () => {
      window.removeEventListener('viewTypeChanged', handleViewTypeChange as EventListener);
    };
  }, []);

  // Debug information
  useEffect(() => {
    console.log(`ViewContainer: Now showing ${viewType} view with ${data.length} items`);
  }, [viewType, data]);

  // Show placeholder if no data available
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 bg-gray-50 rounded-md border border-gray-200">
        <p className="text-gray-500">No data available for this view</p>
      </div>
    );
  }

  const renderView = () => {
    switch (viewType) {
      case 'kanban':
        return <KanbanView projects={data} onStatusChange={onStatusChange} />;
      case 'list':
        return <ListView projects={data} />;
      case 'table':
        return <TableView projects={data} />;
      case 'calendar':
        return <CalendarView projects={data} />;
      case 'gantt':
        return <GanttView projects={data} />;
      default:
        return <KanbanView projects={data} onStatusChange={onStatusChange} />; // Default view
    }
  };

  return (
    <div className="">
      {renderView()}
    </div>
  );
};

export default ViewContainer; 
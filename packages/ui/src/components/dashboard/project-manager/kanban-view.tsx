'use client';
import { useEffect, useState } from 'react';
import {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider,
} from '../../kibo-ui/kanban';
import { DragEndEvent } from '@dnd-kit/core';

// Map status values to column names
const statusToColumnMap = {
  'backlog': 'Backlog',
  'todo': 'To Do',
  'in_progress': 'In Progress',
  'done': 'Done',
  'on_hold': 'On Hold'
};

// Define column colors
const columnColors = {
  'Backlog': '#6B7280',
  'To Do': '#3B82F6',
  'In Progress': '#F59E0B',
  'Done': '#10B981',
  'On Hold': '#EF4444'
};

const columns = [
  { id: 'backlog', name: 'Backlog', color: columnColors['Backlog'] },
  { id: 'todo', name: 'To Do', color: columnColors['To Do'] },
  { id: 'in_progress', name: 'In Progress', color: columnColors['In Progress'] },
  { id: 'done', name: 'Done', color: columnColors['Done'] },
  { id: 'on_hold', name: 'On Hold', color: columnColors['On Hold'] },
];

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const shortDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
});

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

interface KanbanViewProps {
  projects: Project[];
  onStatusChange?: (projectId: string, newStatus: string) => Promise<void>;
}

const KanbanView = ({ projects = [], onStatusChange }: KanbanViewProps) => {
  // Transform projects into the format needed for the KanbanProvider
  const [kanbanItems, setKanbanItems] = useState<any[]>([]);
  
  useEffect(() => {
    // Map projects to the format needed for KanbanProvider
    const transformedProjects = projects.map(project => ({
      id: project.id,
      name: project.name,
      description: project.description || '',
      column: project.status, // This should match the column IDs
      startAt: project.startDate || new Date(),
      endAt: project.dueDate || new Date(),
      // You can add more fields here as needed
    }));
    
    setKanbanItems(transformedProjects);
  }, [projects]);
  
  // Handle data changes from the kanban board
  const handleDataChange = (updatedItems: any[]) => {
    setKanbanItems(updatedItems);
    
    // Find items with changed columns and update their status in the database
    if (onStatusChange) {
      updatedItems.forEach(item => {
        const originalProject = projects.find(p => p.id === item.id);
        if (originalProject && originalProject.status !== item.column) {
          // Status has changed, call the callback
          onStatusChange(item.id, item.column).catch(error => {
            console.error('Failed to update project status:', error);
          });
        }
      });
    }
    
    console.log('Kanban items updated:', updatedItems);
  };
  
  // Handle drag end to detect drops on columns
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeId = active.id.toString();
    const overId = over.id.toString();
    
    // Check if dropping directly onto a column
    const isColumn = columns.some(column => column.id === overId);
    if (isColumn) {
      console.log(`Dropped item ${activeId} onto column ${overId}`);
      
      // Update the kanban items directly
      const newItems = [...kanbanItems];
      const itemIndex = newItems.findIndex(item => item.id === activeId);
      
      if (itemIndex !== -1) {
        const oldColumn = newItems[itemIndex].column;
        
        // Only update if the column changed
        if (oldColumn !== overId) {
          newItems[itemIndex] = {
            ...newItems[itemIndex],
            column: overId
          };
          
          setKanbanItems(newItems);
          
          // Call the status change callback
          if (onStatusChange) {
            onStatusChange(activeId, overId).catch(error => {
              console.error('Failed to update project status on column drop:', error);
            });
          }
        }
      }
    }
  };

  return (
    <KanbanProvider
      onDataChange={handleDataChange}
      onDragEnd={handleDragEnd}
      columns={columns}
      data={kanbanItems}
      className="h-full"
    >
      {(column) => (
        <KanbanBoard key={column.id} id={column.id}>
          <KanbanHeader>
            <div className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: column.color }}
              />
              <span>{column.name}</span>
              <span className="ml-1 text-xs text-stone-500">
                ({kanbanItems.filter(item => item.column === column.id).length})
              </span>
            </div>
          </KanbanHeader>
          <KanbanCards id={column.id}>
            {(item: (typeof kanbanItems)[number]) => (
              <KanbanCard
                key={item.id}
                id={item.id}
                name={item.name}
                column={column.id}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-1">
                    <p className="m-0 flex-1 font-medium text-sm">
                      {item.name}
                    </p>
                    {item.description && (
                      <p className="m-0 text-xs text-stone-500 truncate max-w-[180px]">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
                {(item.startAt || item.endAt) && (
                  <p className="m-0 text-muted-foreground text-xs">
                    {item.startAt && shortDateFormatter.format(new Date(item.startAt))}
                    {item.startAt && item.endAt && ' - '}
                    {item.endAt && dateFormatter.format(new Date(item.endAt))}
                  </p>
                )}
              </KanbanCard>
            )}
          </KanbanCards>
        </KanbanBoard>
      )}
    </KanbanProvider>
  );
};

export default KanbanView;
'use client';
import { CalendarDays, ChevronRight, Clock } from 'lucide-react';
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

interface ListViewProps {
  projects: Project[];
}

// Status mapping to user-friendly labels and colors
const statusMap: Record<string, { label: string, color: string }> = {
  'backlog': { label: 'Backlog', color: 'bg-stone-200 text-stone-800' },
  'todo': { label: 'To Do', color: 'bg-blue-100 text-blue-800' },
  'in_progress': { label: 'In Progress', color: 'bg-amber-100 text-amber-800' },
  'done': { label: 'Done', color: 'bg-emerald-100 text-emerald-800' },
  'on_hold': { label: 'On Hold', color: 'bg-red-100 text-red-800' },
};

// Format date to a readable string
const formatDate = (date: Date | null | undefined): string => {
  if (!date) return 'Not set';
  return new Intl.DateTimeFormat('en-US', { 
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

const ListView = ({ projects = [] }: ListViewProps) => {
  return (
    <div className="divide-y divide-stone-200">
      {projects.length === 0 ? (
        <div className="py-4 text-center text-stone-500">
          No projects to display
        </div>
      ) : (
        projects.map((project) => (
          <div 
            key={project.id} 
            className="py-4 px-2 hover:bg-stone-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-xl">
                  {project.icon || '📁'}
                </div>
                <div>
                  <h3 className="font-medium text-stone-900">{project.name}</h3>
                  {project.description && (
                    <p className="text-sm text-stone-500 mt-1 max-w-md">
                      {project.description.length > 100 
                        ? `${project.description.substring(0, 100)}...` 
                        : project.description}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <span 
                  className={`px-2 py-1 rounded-full text-xs font-medium ${statusMap[project.status]?.color || 'bg-stone-200 text-stone-800'}`}
                >
                  {statusMap[project.status]?.label || project.status}
                </span>
                
                <div className="flex flex-col items-end gap-1 text-sm">
                  {project.startDate && (
                    <div className="flex items-center gap-1 text-stone-500">
                      <CalendarDays className="h-3 w-3" />
                      <span>Start: {formatDate(project.startDate)}</span>
                    </div>
                  )}
                  {project.dueDate && (
                    <div className="flex items-center gap-1 text-stone-500">
                      <Clock className="h-3 w-3" />
                      <span>Due: {formatDate(project.dueDate)}</span>
                    </div>
                  )}
                </div>
                
                <Button variant="ghost" size="icon">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ListView;
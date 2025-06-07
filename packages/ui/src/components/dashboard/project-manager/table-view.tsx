'use client';

import { MoreHorizontal } from 'lucide-react';
import { Button } from '../../button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../table';

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

interface TableViewProps {
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
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-US', { 
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

const TableView = ({ projects = [] }: TableViewProps) => {
  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-stone-500">
                No projects to display
              </TableCell>
            </TableRow>
          ) : (
            projects.map((project) => (
              <TableRow key={project.id} className="hover:bg-stone-50">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{project.icon || '📁'}</span>
                    <span>{project.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span 
                    className={`px-2 py-1 rounded-full text-xs font-medium ${statusMap[project.status]?.color || 'bg-stone-200 text-stone-800'}`}
                  >
                    {statusMap[project.status]?.label || project.status}
                  </span>
                </TableCell>
                <TableCell>{formatDate(project.startDate)}</TableCell>
                <TableCell>{formatDate(project.dueDate)}</TableCell>
                <TableCell>{formatDate(project.createdAt)}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TableView;
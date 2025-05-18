import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useParams } from '@tanstack/react-router'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { CalendarIcon, ArrowLeftIcon } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { useNavigate } from '@tanstack/react-router'

// Define Task type
type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: "todo" | "in_progress" | "done";
  dueDate?: string | null;
  projectId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export const Route = createFileRoute('/project-manager/task/$taskId')({
  component: RouteComponent,
})

// Fetch task by ID function
const fetchTaskById = async (taskId: string): Promise<Task> => {
  const response = await fetch(`/api/tasks/${taskId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch task');
  }
  return response.json();
};

function RouteComponent() {
  const { taskId } = useParams({ from: '/project-manager/task/$taskId' });
  const navigate = useNavigate();
  
  const { data: task, isLoading, error } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => fetchTaskById(taskId),
  });

  const goBack = () => {
    navigate({ to: '/project-manager/tasks' });
  };

  const getStatusStyles = (status: string) => {
    switch(status) {
      case 'todo':
        return 'bg-yellow-900/30 text-yellow-500';
      case 'in_progress':
        return 'bg-blue-900/30 text-blue-500';
      case 'done':
        return 'bg-green-900/30 text-green-500';
      default:
        return 'bg-neutral-800 text-neutral-400';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'todo':
        return 'To Do';
      case 'in_progress':
        return 'In Progress';
      case 'done':
        return 'Done';
      default:
        return status;
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Button 
        variant="ghost" 
        className="mb-4 cursor-pointer flex items-center gap-1" 
        onClick={goBack}
      >
        <ArrowLeftIcon size={16} />
        <span>Back to tasks</span>
      </Button>

      {isLoading ? (
        <div className="cursor-wait text-center py-4">Loading task details...</div>
      ) : error ? (
        <div className="text-red-500 text-center py-4">Error loading task: {error instanceof Error ? error.message : 'Unknown error'}</div>
      ) : task ? (
        <Card className="border-neutral-800">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-xl font-bold">{task.title}</CardTitle>
              <Badge className={`${getStatusStyles(task.status)}`}>
                {getStatusText(task.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {task.description && (
              <div>
                <h3 className="text-sm font-medium text-neutral-400 mb-1">Description</h3>
                <p className="text-neutral-200">{task.description}</p>
              </div>
            )}
            
            <div className="flex flex-wrap gap-y-4 gap-x-8">
              {task.dueDate && (
                <div>
                  <h3 className="text-sm font-medium text-neutral-400 mb-1 flex items-center gap-1">
                    <CalendarIcon size={14} />
                    <span>Due Date</span>
                  </h3>
                  <p className="text-neutral-200">{new Date(task.dueDate).toLocaleDateString()}</p>
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-medium text-neutral-400 mb-1">Created</h3>
                <p className="text-neutral-200">{new Date(task.createdAt).toLocaleDateString()}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-neutral-400 mb-1">Last Updated</h3>
                <p className="text-neutral-200">{new Date(task.updatedAt).toLocaleDateString()}</p>
              </div>
              
              {task.projectId && (
                <div>
                  <h3 className="text-sm font-medium text-neutral-400 mb-1">Project ID</h3>
                  <p className="text-neutral-200">{task.projectId}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-4 text-neutral-500">Task not found</div>
      )}
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

// Define Task type based on the schema
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

export const Route = createFileRoute('/project-manager/tasks')({
  component: RouteComponent,
})

// Fetch tasks function
const fetchTasks = async (): Promise<Task[]> => {
  const response = await fetch('/api/tasks');
  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }
  return response.json();
};

function RouteComponent() {
  const navigate = useNavigate();
  // Query for fetching tasks
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
  });
  
  const handleTaskClick = (taskId: string) => {
    navigate({ to: '/project-manager/task/$taskId', params: { taskId } });
  };
  
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Tasks</h1>
      
      {/* Tasks List */}
      <Card className=" border-neutral-800">
        <CardHeader>
          <CardTitle>Your Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="cursor-wait text-center py-4">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="cursor-default text-center py-4 text-neutral-500">No tasks found. Create one!</div>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <div 
                  key={task.id} 
                  className="p-3 border border-neutral-800 rounded-md cursor-pointer hover:bg-neutral-900/30 transition-colors" 
                  onClick={() => handleTaskClick(task.id)}
                >
                  <h3 className="font-medium">{task.title}</h3>
                  {task.description && <p className="text-sm text-neutral-400">{task.description}</p>}
                  <div className="flex justify-between mt-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      task.status === 'todo' 
                        ? 'bg-yellow-900/30 text-yellow-500' 
                        : task.status === 'in_progress' 
                        ? 'bg-blue-900/30 text-blue-500' 
                        : 'bg-green-900/30 text-green-500'
                    }`}>
                      {task.status === 'todo' 
                        ? 'To Do' 
                        : task.status === 'in_progress' 
                        ? 'In Progress' 
                        : 'Done'}
                    </span>
                    {task.dueDate && (
                      <span className="text-xs text-neutral-500">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

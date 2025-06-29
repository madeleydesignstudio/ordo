import { useEffect } from 'react';
import { useAuth } from '@clerk/tanstack-react-start';
import { trpc } from '../lib/trpc';
import { useTasksStore } from '../lib/store/tasks';

const TaskItem = ({ task }: { task: any }) => {
  const priorityColors = {
    0: '#6b7280', // Low - gray
    1: '#f59e0b', // Medium - amber  
    2: '#ef4444', // High - red
  };

  const priorityLabels = {
    0: 'Low',
    1: 'Medium', 
    2: 'High',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className={`font-semibold text-lg ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
            {task.title}
          </h3>
          {task.description && (
            <p className="text-gray-600 mt-1 text-sm">{task.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <span 
              className="px-2 py-1 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: priorityColors[task.priority as keyof typeof priorityColors] }}
            >
              {priorityLabels[task.priority as keyof typeof priorityLabels]}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(task.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="ml-4">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => {}}
            className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

export const TaskList = () => {
  const { isSignedIn, userId } = useAuth();
  const { tasks, isLoading, error, setTasks, setLoading, setError } = useTasksStore();

     const tasksQuery = trpc.getTasks.useQuery(undefined, {
     enabled: isSignedIn && !!userId,
     onSuccess: (data) => {
       // Convert string dates to Date objects
       const normalizedTasks = data.map(task => ({
         ...task,
         createdAt: new Date(task.createdAt),
         updatedAt: new Date(task.updatedAt),
       }));
       setTasks(normalizedTasks);
       setLoading(false);
     },
     onError: (error) => {
       setError(error.message);
       setLoading(false);
     },
   });

  useEffect(() => {
    if (tasksQuery.isLoading) {
      setLoading(true);
    }
  }, [tasksQuery.isLoading, setLoading]);

  if (!isSignedIn) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Please sign in to view your tasks.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-500">Loading tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading tasks: {error}</p>
        <button 
          onClick={() => tasksQuery.refetch()}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
        <p className="text-gray-600 mt-1">
          {pendingTasks.length} pending, {completedTasks.length} completed
        </p>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No tasks found.</p>
          <p className="text-gray-400 text-sm mt-2">Start by creating your first task!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingTasks.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Pending Tasks</h2>
              <div className="space-y-3">
                {pendingTasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}

          {completedTasks.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Completed Tasks</h2>
              <div className="space-y-3">
                {completedTasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 
import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
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
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '8px', 
      border: '1px solid #e5e7eb',
      padding: '16px', 
      marginBottom: '12px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ 
            fontWeight: '600', 
            fontSize: '18px',
            textDecoration: task.completed ? 'line-through' : 'none',
            color: task.completed ? '#6b7280' : '#111827',
            margin: '0 0 8px 0'
          }}>
            {task.title}
          </h3>
          {task.description && (
            <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 12px 0' }}>
              {task.description}
            </p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ 
              backgroundColor: priorityColors[task.priority as keyof typeof priorityColors],
              color: 'white',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              {priorityLabels[task.priority as keyof typeof priorityLabels]}
            </span>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>
              {new Date(task.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div style={{ marginLeft: '16px' }}>
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => {}}
            style={{ width: '20px', height: '20px' }}
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
      <div style={{ textAlign: 'center', padding: '32px' }}>
        <p style={{ color: '#6b7280' }}>Please sign in to view your tasks.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '32px' }}>
        <div style={{ 
          width: '32px', 
          height: '32px', 
          border: '2px solid #e5e7eb',
          borderTop: '2px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }}></div>
        <p style={{ marginTop: '8px', color: '#6b7280' }}>Loading tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '32px' }}>
        <p style={{ color: '#ef4444' }}>Error loading tasks: {error}</p>
        <button 
          onClick={() => tasksQuery.refetch()}
          style={{ 
            marginTop: '8px',
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', margin: '0 0 8px 0' }}>
          My Tasks
        </h1>
        <p style={{ color: '#6b7280', margin: 0 }}>
          {pendingTasks.length} pending, {completedTasks.length} completed
        </p>
      </div>

      {tasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px' }}>
          <p style={{ color: '#6b7280', fontSize: '18px', margin: '0 0 8px 0' }}>No tasks found.</p>
          <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>Start by creating your first task!</p>
        </div>
      ) : (
        <div>
          {pendingTasks.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#374151', marginBottom: '16px' }}>
                Pending Tasks
              </h2>
              {pendingTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          )}

          {completedTasks.length > 0 && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#374151', marginBottom: '16px' }}>
                Completed Tasks
              </h2>
              {completedTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 
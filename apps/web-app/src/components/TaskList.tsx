import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/tanstack-react-start';
import { trpc } from '../lib/trpc';
import { useTasksStore } from '../lib/store/tasks';

interface TaskFormData {
  title: string;
  description: string;
  priority: number;
}

const TaskForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    priority: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addTask } = useTasksStore();
  const createTaskMutation = trpc.createTask.useMutation({
    onSuccess: (newTask) => {
      addTask({
        ...newTask,
        createdAt: new Date(newTask.createdAt),
        updatedAt: new Date(newTask.updatedAt),
      });
      setFormData({ title: '', description: '', priority: 0 });
      setIsSubmitting(false);
      onSuccess();
    },
    onError: (error) => {
      console.error('Failed to create task:', error);
      setIsSubmitting(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    
    setIsSubmitting(true);
    createTaskMutation.mutate({
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      priority: formData.priority,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Task</h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter task title..."
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter task description..."
            rows={3}
          />
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            id="priority"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={0}>Low</option>
            <option value={1}>Medium</option>
            <option value={2}>High</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !formData.title.trim()}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Creating...' : 'Create Task'}
        </button>
      </div>
    </form>
  );
};

const TaskItem = ({ task }: { task: any }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description || '',
    priority: task.priority,
  });

  const { updateTask, removeTask } = useTasksStore();

  const updateTaskMutation = trpc.updateTask.useMutation({
    onSuccess: (updatedTask) => {
      updateTask(task.id, {
        ...updatedTask,
        createdAt: new Date(updatedTask.createdAt),
        updatedAt: new Date(updatedTask.updatedAt),
      });
      setIsEditing(false);
    },
    onError: (error) => {
      console.error('Failed to update task:', error);
    },
  });

  const deleteTaskMutation = trpc.deleteTask.useMutation({
    onSuccess: () => {
      removeTask(task.id);
    },
    onError: (error) => {
      console.error('Failed to delete task:', error);
    },
  });

  const handleCompleteToggle = () => {
    updateTaskMutation.mutate({
      id: task.id,
      completed: !task.completed,
    });
  };

  const handleSaveEdit = () => {
    if (!editData.title.trim()) return;
    
    updateTaskMutation.mutate({
      id: task.id,
      title: editData.title.trim(),
      description: editData.description.trim() || undefined,
      priority: editData.priority,
    });
  };

  const handleCancelEdit = () => {
    setEditData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTaskMutation.mutate({ id: task.id });
    }
  };

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

  if (isEditing) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
        <div className="space-y-3">
          <input
            type="text"
            value={editData.title}
            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Task title..."
          />
          <textarea
            value={editData.description}
            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Task description..."
            rows={2}
          />
          <select
            value={editData.priority}
            onChange={(e) => setEditData({ ...editData, priority: parseInt(e.target.value) })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={0}>Low</option>
            <option value={1}>Medium</option>
            <option value={2}>High</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={handleSaveEdit}
              disabled={updateTaskMutation.isLoading || !editData.title.trim()}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 text-sm"
            >
              {updateTaskMutation.isLoading ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleCancelEdit}
              className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

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
        
        <div className="ml-4 flex items-center gap-2">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={handleCompleteToggle}
            disabled={updateTaskMutation.isLoading}
            className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
          <button
            onClick={() => setIsEditing(true)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteTaskMutation.isLoading}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            {deleteTaskMutation.isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const TaskList = () => {
  const { isSignedIn, userId } = useAuth();
  const { tasks, isLoading, error, setTasks, setLoading, setError } = useTasksStore();
  const [showForm, setShowForm] = useState(false);

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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-gray-600 mt-1">
            {pendingTasks.length} pending, {completedTasks.length} completed
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          {showForm ? 'Cancel' : 'New Task'}
        </button>
      </div>

      {showForm && <TaskForm onSuccess={() => setShowForm(false)} />}

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
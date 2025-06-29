import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
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
    <form onSubmit={handleSubmit} style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      padding: '24px',
      marginBottom: '24px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
    }}>
      <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
        Create New Task
      </h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
            Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
            placeholder="Enter task title..."
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none',
              resize: 'vertical',
              minHeight: '80px',
              fontFamily: 'inherit',
              boxSizing: 'border-box'
            }}
            placeholder="Enter task description..."
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
            Priority
          </label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none',
              backgroundColor: 'white',
              boxSizing: 'border-box'
            }}
          >
            <option value={0}>Low</option>
            <option value={1}>Medium</option>
            <option value={2}>High</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !formData.title.trim()}
          style={{
            width: '100%',
            backgroundColor: isSubmitting || !formData.title.trim() ? '#9ca3af' : '#3b82f6',
            color: 'white',
            padding: '10px 16px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '14px',
            fontWeight: '500',
            cursor: isSubmitting || !formData.title.trim() ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s'
          }}
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
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '8px', 
        border: '1px solid #e5e7eb',
        padding: '16px', 
        marginBottom: '12px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            type="text"
            value={editData.title}
            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
            placeholder="Task title..."
          />
          <textarea
            value={editData.description}
            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none',
              resize: 'vertical',
              minHeight: '60px',
              fontFamily: 'inherit',
              boxSizing: 'border-box'
            }}
            placeholder="Task description..."
          />
          <select
            value={editData.priority}
            onChange={(e) => setEditData({ ...editData, priority: parseInt(e.target.value) })}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none',
              backgroundColor: 'white',
              width: 'fit-content'
            }}
          >
            <option value={0}>Low</option>
            <option value={1}>Medium</option>
            <option value={2}>High</option>
          </select>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleSaveEdit}
              disabled={updateTaskMutation.isLoading || !editData.title.trim()}
              style={{
                padding: '6px 12px',
                backgroundColor: updateTaskMutation.isLoading || !editData.title.trim() ? '#9ca3af' : '#16a34a',
                color: 'white',
                borderRadius: '4px',
                border: 'none',
                fontSize: '12px',
                cursor: updateTaskMutation.isLoading || !editData.title.trim() ? 'not-allowed' : 'pointer'
              }}
            >
              {updateTaskMutation.isLoading ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleCancelEdit}
              style={{
                padding: '6px 12px',
                backgroundColor: '#6b7280',
                color: 'white',
                borderRadius: '4px',
                border: 'none',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

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
        
        <div style={{ marginLeft: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            checked={task.completed}
            onChange={handleCompleteToggle}
            disabled={updateTaskMutation.isLoading}
            style={{ width: '20px', height: '20px' }}
          />
          <button
            onClick={() => setIsEditing(true)}
            style={{
              color: '#3b82f6',
              fontSize: '12px',
              fontWeight: '500',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteTaskMutation.isLoading}
            style={{
              color: '#ef4444',
              fontSize: '12px',
              fontWeight: '500',
              border: 'none',
              background: 'none',
              cursor: deleteTaskMutation.isLoading ? 'not-allowed' : 'pointer',
              textDecoration: 'underline'
            }}
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
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', margin: '0 0 8px 0' }}>
            My Tasks
          </h1>
          <p style={{ color: '#6b7280', margin: 0 }}>
            {pendingTasks.length} pending, {completedTasks.length} completed
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          {showForm ? 'Cancel' : 'New Task'}
        </button>
      </div>

      {showForm && <TaskForm onSuccess={() => setShowForm(false)} />}

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
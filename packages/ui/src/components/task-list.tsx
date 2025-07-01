import { useState, useEffect } from 'react';
import { Button } from './button.js';
import type { User } from '@supabase/supabase-js';

interface Task {
  id: string;
  title: string;
  description?: string;
  is_completed: boolean;
  created_at: string;
  user_id: string;
}

interface TaskListProps {
  user: User;
  db: {
    tasks: {
      getByUserId: (userId: string) => Promise<{ data: Task[] | null; error: any }>;
      create: (taskData: { title: string; description?: string; user_id: string }) => Promise<{ data: Task | null; error: any }>;
      update: (id: string, updates: { title?: string; description?: string; is_completed?: boolean }) => Promise<{ data: Task | null; error: any }>;
      delete: (id: string) => Promise<{ error: any }>;
    };
  };
}

export function TaskList({ user, db }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Load tasks on component mount
  useEffect(() => {
    loadTasks();
  }, [user.id]);

  const loadTasks = async () => {
    try {
      const { data, error } = await db.tasks.getByUserId(user.id);
      if (error) {
        console.error('Error loading tasks:', error);
      } else {
        setTasks(data || []);
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      setIsCreating(true);
      const { data, error } = await db.tasks.create({
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim() || undefined,
        user_id: user.id,
      });

      if (error) {
        console.error('Error creating task:', error);
      } else if (data) {
        setTasks([data, ...tasks]);
        setNewTaskTitle('');
        setNewTaskDescription('');
      }
    } catch (err) {
      console.error('Failed to create task:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const toggleTaskComplete = async (taskId: string, isCompleted: boolean) => {
    try {
      const { data, error } = await db.tasks.update(taskId, {
        is_completed: !isCompleted,
      });

      if (error) {
        console.error('Error updating task:', error);
      } else if (data) {
        setTasks(tasks.map(task => 
          task.id === taskId ? { ...task, is_completed: data.is_completed } : task
        ));
      }
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
  };

  const saveEdit = async (taskId: string) => {
    if (!editTitle.trim()) return;

    try {
      const { data, error } = await db.tasks.update(taskId, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
      });

      if (error) {
        console.error('Error updating task:', error);
      } else if (data) {
        setTasks(tasks.map(task => 
          task.id === taskId ? { ...task, title: data.title, description: data.description } : task
        ));
        setEditingTaskId(null);
      }
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditTitle('');
    setEditDescription('');
  };

  const confirmDelete = async (taskId: string) => {
    console.log('Deleting task:', taskId);
    
    try {
      const { error } = await db.tasks.delete(taskId);
      
      if (error) {
        console.error('Error deleting task:', error);
      } else {
        console.log('Task deleted successfully, updating UI...');
        setTasks(tasks.filter(task => task.id !== taskId));
      }
    } catch (err) {
      console.error('Failed to delete task:', err);
    } finally {
      setDeleteConfirmId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Tasks</h2>
        
        {/* Create new task form */}
        <form onSubmit={createTask} className="bg-white p-6 rounded-lg shadow">
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Task Title
            </label>
            <input
              type="text"
              id="title"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter task title..."
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              id="description"
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter task description..."
              rows={3}
            />
          </div>
          <Button type="submit" disabled={isCreating || !newTaskTitle.trim()}>
            {isCreating ? 'Creating...' : 'Create Task'}
          </Button>
        </form>
      </div>

      {/* Delete confirmation modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Task</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to permanently delete this task? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => confirmDelete(deleteConfirmId)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tasks list */}
      <div className="space-y-4">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No tasks yet. Create your first task above!
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="bg-white p-6 rounded-lg shadow">
              {editingTaskId === task.id ? (
                /* Edit mode */
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                  <div className="flex space-x-2">
                    <Button onClick={() => saveEdit(task.id)}>Save</Button>
                    <Button variant="outline" onClick={cancelEdit}>Cancel</Button>
                  </div>
                </div>
              ) : (
                /* View mode */
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <input
                      type="checkbox"
                      checked={task.is_completed}
                      onChange={() => toggleTaskComplete(task.id, task.is_completed)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <h3 className={`text-lg font-medium ${task.is_completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className={`mt-1 ${task.is_completed ? 'line-through text-gray-400' : 'text-gray-600'}`}>
                          {task.description}
                        </p>
                      )}
                      <p className="mt-2 text-sm text-gray-400">
                        Created: {new Date(task.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEditing(task)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteConfirmId(task.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
} 
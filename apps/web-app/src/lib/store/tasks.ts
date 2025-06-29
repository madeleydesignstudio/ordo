import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Task } from '@ordo/database';

interface TasksState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useTasksStore = create<TasksState>()(
  devtools(
    (set, get) => ({
      tasks: [],
      isLoading: false,
      error: null,
      
      setTasks: (tasks) => 
        set({ tasks }, false, 'setTasks'),
      
      addTask: (task) => 
        set((state) => ({ 
          tasks: [...state.tasks, task] 
        }), false, 'addTask'),
      
      updateTask: (id, updates) => 
        set((state) => ({
          tasks: state.tasks.map(task => 
            task.id === id ? { ...task, ...updates } : task
          )
        }), false, 'updateTask'),
      
      removeTask: (id) => 
        set((state) => ({
          tasks: state.tasks.filter(task => task.id !== id)
        }), false, 'removeTask'),
      
      setLoading: (isLoading) => 
        set({ isLoading }, false, 'setLoading'),
      
      setError: (error) => 
        set({ error }, false, 'setError'),
    }),
    { name: 'tasks-store' }
  )
); 
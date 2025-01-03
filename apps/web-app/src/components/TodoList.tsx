import { useState, useEffect } from "react";
import { Check, Trash2, Edit2, Plus, X } from "lucide-react";
import { useTodos } from "../hooks/useTodos";
import { Todo } from "../types";

export function TodoList({ date }: { date: string }) {
  const { todos, addTodo, updateTodo, deleteTodo, isLoading } = useTodos(date);
  const [newTask, setNewTask] = useState("");
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [showCompleted, setShowCompleted] = useState(true);

  // Clear input when date changes
  useEffect(() => {
    setNewTask("");
    setEditingTodo(null);
  }, [date]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    addTodo(newTask);
    setNewTask("");
  };

  const handleUpdate = (todo: Todo, content: string) => {
    updateTodo({ ...todo, content });
    setEditingTodo(null);
  };

  const filteredTodos = showCompleted
    ? todos
    : todos.filter((todo) => !todo.completed);

  const completedCount = todos.filter((todo) => todo.completed).length;

  return (
    <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Tasks</h2>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            {completedCount}/{todos.length} completed
          </div>
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            {showCompleted ? "Hide" : "Show"} completed
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={!newTask.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </form>

      <div className="space-y-2">
        {filteredTodos.map((todo) => (
          <div
            key={todo.id}
            className={`flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 ${
              todo.completed ? "opacity-75" : ""
            }`}
          >
            <button
              onClick={() =>
                updateTodo({ ...todo, completed: !todo.completed })
              }
              className={`w-5 h-5 rounded border ${
                todo.completed
                  ? "bg-green-500 border-green-500 text-white"
                  : "border-gray-300 hover:border-gray-400"
              } flex items-center justify-center`}
            >
              {todo.completed && <Check className="w-3 h-3" />}
            </button>

            {editingTodo?.id === todo.id ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdate(todo, editingTodo.content);
                }}
                className="flex-1 flex gap-2"
              >
                <input
                  type="text"
                  value={editingTodo.content}
                  onChange={(e) =>
                    setEditingTodo({ ...editingTodo, content: e.target.value })
                  }
                  className="flex-1 px-2 py-1 border rounded"
                  autoFocus
                />
                <button
                  type="submit"
                  className="p-1 text-green-600 hover:text-green-700"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingTodo(null)}
                  className="p-1 text-gray-600 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <>
                <span
                  className={`flex-1 ${
                    todo.completed ? "line-through text-gray-500" : ""
                  }`}
                >
                  {todo.content}
                </span>
                <button
                  onClick={() => setEditingTodo(todo)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="p-1 text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="text-sm text-gray-500 text-center py-2">
            Saving changes...
          </div>
        )}
      </div>
    </div>
  );
}

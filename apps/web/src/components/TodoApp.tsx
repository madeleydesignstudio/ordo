import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { todoService, type Todo } from "../lib/todoService";

export function TodoApp() {
  const queryClient = useQueryClient();
  const [newTodoName, setNewTodoName] = useState("Arthur");

  // Query all todos
  const {
    data: todos = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["todos"],
    queryFn: () => todoService.getAllTodos(),
  });

  // Query stats
  const { data: stats } = useQuery({
    queryKey: ["todo-stats"],
    queryFn: () => todoService.getTodoStats(),
  });

  // Query top todos
  const { data: topTodos = [] } = useQuery({
    queryKey: ["top-todos"],
    queryFn: () => todoService.getTopTodos(3),
  });

  // Create todo mutation
  const createMutation = useMutation({
    mutationFn: (todo: { name: string; number: number }) =>
      todoService.createTodo(todo),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      queryClient.invalidateQueries({ queryKey: ["todo-stats"] });
      queryClient.invalidateQueries({ queryKey: ["top-todos"] });
    },
  });

  // Delete todo mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => todoService.deleteTodo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      queryClient.invalidateQueries({ queryKey: ["todo-stats"] });
      queryClient.invalidateQueries({ queryKey: ["top-todos"] });
    },
  });

  // Clear all mutation
  const clearAllMutation = useMutation({
    mutationFn: () => todoService.clearAllTodos(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      queryClient.invalidateQueries({ queryKey: ["todo-stats"] });
      queryClient.invalidateQueries({ queryKey: ["top-todos"] });
    },
  });

  const handleAddTodo = () => {
    createMutation.mutate({
      name: newTodoName,
      number: Math.floor(Math.random() * 100),
    });
  };

  const handleDeleteTodo = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleClearAll = () => {
    clearAllMutation.mutate();
  };

  if (isLoading) {
    return <div style={{ padding: "20px" }}>Loading todos...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: "20px", color: "red" }}>
        Error loading todos: {(error as Error).message}
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", fontFamily: "system-ui" }}>
      <h2>📝 Offline-First Todo App</h2>
      <p style={{ color: "#666", marginBottom: "20px" }}>
        TanStack Query + PGLite for reactive offline-first experience
      </p>

      {/* Add Todo Form */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          value={newTodoName}
          onChange={(e) => setNewTodoName(e.target.value)}
          placeholder="Enter todo name"
          style={{
            padding: "8px",
            marginRight: "10px",
            border: "1px solid #ddd",
            borderRadius: "4px",
          }}
        />
        <button
          onClick={handleAddTodo}
          disabled={createMutation.isPending || !newTodoName.trim()}
          style={{ marginRight: "10px" }}
        >
          {createMutation.isPending ? "Adding..." : "➕ Add Todo"}
        </button>
        <button onClick={handleClearAll} disabled={clearAllMutation.isPending}>
          {clearAllMutation.isPending ? "Clearing..." : "🗑️ Clear All"}
        </button>
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}
      >
        {/* Todos List */}
        <div>
          <h3>🚀 All Todos ({todos.length})</h3>
          {todos.length === 0 ? (
            <p style={{ color: "#666" }}>No todos yet. Add some!</p>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    padding: "12px",
                    backgroundColor: "#f9f9f9",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div>
                      <strong>{todo.name}</strong> ({todo.number})
                    </div>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      {todo.created_at.toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteTodo(todo.id)}
                    disabled={deleteMutation.isPending}
                    style={{
                      background: "#ff4444",
                      color: "white",
                      border: "none",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    ❌
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Analytics */}
        <div>
          <h3>📊 Analytics</h3>
          <div style={{ marginBottom: "15px" }}>
            <strong>Stats:</strong>
            <br />
            Total: {stats?.count || 0} todos
            <br />
            Average number: {stats?.avgNumber || 0}
          </div>

          <div>
            <strong>🏆 Top 3 by number:</strong>
            {topTodos.length === 0 ? (
              <p style={{ color: "#666" }}>No todos yet</p>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: "4px" }}
              >
                {topTodos.map((todo, index) => (
                  <div
                    key={todo.id}
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      padding: "8px",
                      fontSize: "14px",
                      backgroundColor: "#f0f8ff",
                    }}
                  >
                    #{index + 1} {todo.name} ({todo.number})
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status */}
      <div
        style={{
          marginTop: "20px",
          fontSize: "12px",
          color: "#666",
          border: "1px solid #eee",
          padding: "10px",
          borderRadius: "4px",
        }}
      >
        <strong>✨ Benefits:</strong>
        <br />• PGLite: Full PostgreSQL database in browser (offline-first)
        <br />• TanStack Query: Optimistic updates, caching, background refetch
        <br />• No complex sync logic: Each tool does what it's designed for
        <br />• Data persists across browser sessions in IndexedDB
      </div>
    </div>
  );
}

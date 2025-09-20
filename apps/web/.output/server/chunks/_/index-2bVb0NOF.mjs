import { jsx, jsxs } from 'react/jsx-runtime';
import { useState } from 'react';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { t as todoService } from './ssr.mjs';
import '@tanstack/react-router';
import '@electric-sql/pglite';
import '@electric-sql/pglite/live';
import '@electric-sql/pglite-react';
import '@tanstack/history';
import '@tanstack/router-core/ssr/client';
import '@tanstack/router-core';
import '@tanstack/router-core/ssr/server';
import 'node:async_hooks';
import 'tiny-invariant';
import '@tanstack/react-router/ssr/server';

function TodoApp() {
  const queryClient = useQueryClient();
  const [newTodoName, setNewTodoName] = useState("Arthur");
  const {
    data: todos = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ["todos"],
    queryFn: () => todoService.getAllTodos()
  });
  const { data: stats } = useQuery({
    queryKey: ["todo-stats"],
    queryFn: () => todoService.getTodoStats()
  });
  const { data: topTodos = [] } = useQuery({
    queryKey: ["top-todos"],
    queryFn: () => todoService.getTopTodos(3)
  });
  const createMutation = useMutation({
    mutationFn: (todo) => todoService.createTodo(todo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      queryClient.invalidateQueries({ queryKey: ["todo-stats"] });
      queryClient.invalidateQueries({ queryKey: ["top-todos"] });
    }
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => todoService.deleteTodo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      queryClient.invalidateQueries({ queryKey: ["todo-stats"] });
      queryClient.invalidateQueries({ queryKey: ["top-todos"] });
    }
  });
  const clearAllMutation = useMutation({
    mutationFn: () => todoService.clearAllTodos(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      queryClient.invalidateQueries({ queryKey: ["todo-stats"] });
      queryClient.invalidateQueries({ queryKey: ["top-todos"] });
    }
  });
  const handleAddTodo = () => {
    createMutation.mutate({
      name: newTodoName,
      number: Math.floor(Math.random() * 100)
    });
  };
  const handleDeleteTodo = (id) => {
    deleteMutation.mutate(id);
  };
  const handleClearAll = () => {
    clearAllMutation.mutate();
  };
  if (isLoading) {
    return /* @__PURE__ */ jsx("div", { style: { padding: "20px" }, children: "Loading todos..." });
  }
  if (error) {
    return /* @__PURE__ */ jsxs("div", { style: { padding: "20px", color: "red" }, children: [
      "Error loading todos: ",
      error.message
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { style: { padding: "20px", fontFamily: "system-ui" }, children: [
    /* @__PURE__ */ jsx("h2", { children: "\u{1F4DD} Offline-First Todo App" }),
    /* @__PURE__ */ jsx("p", { style: { color: "#666", marginBottom: "20px" }, children: "TanStack Query + PGLite for reactive offline-first experience" }),
    /* @__PURE__ */ jsxs("div", { style: { marginBottom: "20px" }, children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          value: newTodoName,
          onChange: (e) => setNewTodoName(e.target.value),
          placeholder: "Enter todo name",
          style: {
            padding: "8px",
            marginRight: "10px",
            border: "1px solid #ddd",
            borderRadius: "4px"
          }
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handleAddTodo,
          disabled: createMutation.isPending || !newTodoName.trim(),
          style: { marginRight: "10px" },
          children: createMutation.isPending ? "Adding..." : "\u2795 Add Todo"
        }
      ),
      /* @__PURE__ */ jsx("button", { onClick: handleClearAll, disabled: clearAllMutation.isPending, children: clearAllMutation.isPending ? "Clearing..." : "\u{1F5D1}\uFE0F Clear All" })
    ] }),
    /* @__PURE__ */ jsxs(
      "div",
      {
        style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" },
        children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("h3", { children: [
              "\u{1F680} All Todos (",
              todos.length,
              ")"
            ] }),
            todos.length === 0 ? /* @__PURE__ */ jsx("p", { style: { color: "#666" }, children: "No todos yet. Add some!" }) : /* @__PURE__ */ jsx(
              "div",
              {
                style: { display: "flex", flexDirection: "column", gap: "8px" },
                children: todos.map((todo) => /* @__PURE__ */ jsxs(
                  "div",
                  {
                    style: {
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      padding: "12px",
                      backgroundColor: "#f9f9f9",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    },
                    children: [
                      /* @__PURE__ */ jsxs("div", { children: [
                        /* @__PURE__ */ jsxs("div", { children: [
                          /* @__PURE__ */ jsx("strong", { children: todo.name }),
                          " (",
                          todo.number,
                          ")"
                        ] }),
                        /* @__PURE__ */ jsx("div", { style: { fontSize: "12px", color: "#666" }, children: todo.created_at.toLocaleString() })
                      ] }),
                      /* @__PURE__ */ jsx(
                        "button",
                        {
                          onClick: () => handleDeleteTodo(todo.id),
                          disabled: deleteMutation.isPending,
                          style: {
                            background: "#ff4444",
                            color: "white",
                            border: "none",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            cursor: "pointer"
                          },
                          children: "\u274C"
                        }
                      )
                    ]
                  },
                  todo.id
                ))
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { children: "\u{1F4CA} Analytics" }),
            /* @__PURE__ */ jsxs("div", { style: { marginBottom: "15px" }, children: [
              /* @__PURE__ */ jsx("strong", { children: "Stats:" }),
              /* @__PURE__ */ jsx("br", {}),
              "Total: ",
              (stats == null ? void 0 : stats.count) || 0,
              " todos",
              /* @__PURE__ */ jsx("br", {}),
              "Average number: ",
              (stats == null ? void 0 : stats.avgNumber) || 0
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("strong", { children: "\u{1F3C6} Top 3 by number:" }),
              topTodos.length === 0 ? /* @__PURE__ */ jsx("p", { style: { color: "#666" }, children: "No todos yet" }) : /* @__PURE__ */ jsx(
                "div",
                {
                  style: { display: "flex", flexDirection: "column", gap: "4px" },
                  children: topTodos.map((todo, index) => /* @__PURE__ */ jsxs(
                    "div",
                    {
                      style: {
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        padding: "8px",
                        fontSize: "14px",
                        backgroundColor: "#f0f8ff"
                      },
                      children: [
                        "#",
                        index + 1,
                        " ",
                        todo.name,
                        " (",
                        todo.number,
                        ")"
                      ]
                    },
                    todo.id
                  ))
                }
              )
            ] })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxs(
      "div",
      {
        style: {
          marginTop: "20px",
          fontSize: "12px",
          color: "#666",
          border: "1px solid #eee",
          padding: "10px",
          borderRadius: "4px"
        },
        children: [
          /* @__PURE__ */ jsx("strong", { children: "\u2728 Benefits:" }),
          /* @__PURE__ */ jsx("br", {}),
          "\u2022 PGLite: Full PostgreSQL database in browser (offline-first)",
          /* @__PURE__ */ jsx("br", {}),
          "\u2022 TanStack Query: Optimistic updates, caching, background refetch",
          /* @__PURE__ */ jsx("br", {}),
          "\u2022 No complex sync logic: Each tool does what it's designed for",
          /* @__PURE__ */ jsx("br", {}),
          "\u2022 Data persists across browser sessions in IndexedDB"
        ]
      }
    )
  ] });
}
function Home() {
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-background", children: /* @__PURE__ */ jsx(TodoApp, {}) });
}

export { Home as component };
//# sourceMappingURL=index-2bVb0NOF.mjs.map

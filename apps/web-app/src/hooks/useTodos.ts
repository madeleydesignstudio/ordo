import { useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { Todo } from "../types";
import { useSupabaseQuery } from "./useSupabaseQuery";

export function useTodos(date: string) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    data: todos,
    error,
    refetch: refetchTodos,
  } = useSupabaseQuery<Todo[]>(async () => {
    const result = await supabase
      .from("todos")
      .select("*")
      .eq("date", date)
      .order("created_at", { ascending: true });
    return result;
  }, [date]);

  const addTodo = useCallback(
    async (content: string) => {
      try {
        setIsLoading(true);
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) throw new Error("Not authenticated");

        const { error } = await supabase.from("todos").insert([
          {
            user_id: userData.user.id,
            date,
            content,
            completed: false,
          },
        ]);

        if (error) throw error;
        await refetchTodos();
      } catch (error) {
        console.error("Error adding todo:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [date, refetchTodos]
  );

  const updateTodo = useCallback(
    async (todo: Todo) => {
      try {
        setIsLoading(true);
        const { error } = await supabase
          .from("todos")
          .update({
            content: todo.content,
            completed: todo.completed,
            completed_at: todo.completed ? new Date().toISOString() : null,
          })
          .eq("id", todo.id);

        if (error) throw error;
        await refetchTodos();
      } catch (error) {
        console.error("Error updating todo:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [refetchTodos]
  );

  const deleteTodo = useCallback(
    async (id: string) => {
      try {
        setIsLoading(true);
        const { error } = await supabase.from("todos").delete().eq("id", id);

        if (error) throw error;
        await refetchTodos();
      } catch (error) {
        console.error("Error deleting todo:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [refetchTodos]
  );

  return {
    todos: todos || [],
    error,
    addTodo,
    updateTodo,
    deleteTodo,
    isLoading,
  };
}

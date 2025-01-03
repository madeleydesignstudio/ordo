import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Todo } from "../types";
import { supabase } from "../lib/supabase";

export function useOptimisticTodos(date: string) {
  const queryClient = useQueryClient();
  const queryKey = ["todos", date];

  return useMutation({
    mutationFn: async (newTodo: Partial<Todo>) => {
      const { data, error } = await supabase
        .from("todos")
        .insert([newTodo])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async (newTodo) => {
      await queryClient.cancelQueries({ queryKey });
      const previousTodos = queryClient.getQueryData<Todo[]>(queryKey);

      queryClient.setQueryData<Todo[]>(queryKey, (old = []) => [
        ...old,
        { ...newTodo, id: crypto.randomUUID() } as Todo,
      ]);

      return { previousTodos };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(queryKey, context?.previousTodos);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

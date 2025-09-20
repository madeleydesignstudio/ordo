import { supabase } from "./auth.js";
import type { Todo } from "./schema.js";

interface SyncResult {
  success: boolean;
  count: number;
  error?: string;
}

interface CloudTodo {
  id: string;
  name: string;
  number: number;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export class CloudTodoService {
  private static readonly SUPABASE_NOT_CONFIGURED_ERROR =
    "Supabase not configured. Please set VITE_PUBLIC_SUPABASE_URL and VITE_PUBLIC_SUPABASE_ANON_KEY environment variables.";

  private isSupabaseConfigured(): boolean {
    return !!supabase;
  }

  private validateSupabaseConfiguration(): void {
    if (!this.isSupabaseConfigured()) {
      throw new Error(CloudTodoService.SUPABASE_NOT_CONFIGURED_ERROR);
    }
  }

  private transformTodoForCloud(
    todo: Omit<Todo, "userId">,
    userId: string,
  ): CloudTodo {
    const now = new Date().toISOString();

    return {
      id: todo.id,
      name: todo.name,
      number: todo.number,
      created_at: todo.createdAt?.toISOString() || now,
      updated_at: todo.updatedAt?.toISOString() || now,
      user_id: userId,
    };
  }

  async pushLocalTodos(
    localTodos: Omit<Todo, "userId">[],
    userId: string,
  ): Promise<SyncResult> {
    try {
      if (!this.isSupabaseConfigured()) {
        return {
          success: false,
          count: 0,
          error: CloudTodoService.SUPABASE_NOT_CONFIGURED_ERROR,
        };
      }

      const todosForCloud = localTodos.map((todo) =>
        this.transformTodoForCloud(todo, userId),
      );

      const { data, error } = await supabase!
        .from("todos")
        .upsert(todosForCloud, {
          onConflict: "id",
          ignoreDuplicates: false,
        })
        .select();

      if (error) {
        throw error;
      }

      return {
        success: true,
        count: data?.length || 0,
      };
    } catch (error) {
      return {
        success: false,
        count: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async getTodosByUserId(userId: string): Promise<CloudTodo[]> {
    this.validateSupabaseConfiguration();

    const { data, error } = await supabase!
      .from("todos")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    return data || [];
  }

  async deleteTodo(id: string): Promise<void> {
    this.validateSupabaseConfiguration();

    const { error } = await supabase!.from("todos").delete().eq("id", id);

    if (error) {
      throw error;
    }
  }
}

export const cloudTodoService = new CloudTodoService();

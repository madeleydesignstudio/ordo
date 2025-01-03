import { supabase } from "@workspace/supabase";
import { Task } from "../types/task";

export async function updateTaskStatus(
  taskId: string,
  status: "pending" | "completed"
) {
  const { error } = await supabase
    .from("tasks")
    .update({ status })
    .eq("id", taskId);

  if (error) {
    throw error;
  }
}

export async function fetchTasks() {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data as Task[];
}

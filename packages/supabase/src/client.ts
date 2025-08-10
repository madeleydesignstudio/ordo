import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Factory function to create Supabase client
export function createSupabaseClient() {
  // Get environment variables at runtime
  const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local file.",
    );
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

// Export types for convenience
export type { Database } from "./types";
export type { User, Session, AuthError } from "@supabase/supabase-js";

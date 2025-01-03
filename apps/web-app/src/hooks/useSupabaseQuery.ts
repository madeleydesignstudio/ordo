import { useEffect, useState } from "react";
import { PostgrestError } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

interface UseSupabaseQueryResult<T> {
  data: T | null;
  error: PostgrestError | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

export function useSupabaseQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: PostgrestError | null }>,
  deps: React.DependencyList = []
): UseSupabaseQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<PostgrestError | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await queryFn();

      if (error) {
        setError(error);
        setData(null);
      } else {
        setData(data);
        setError(null);
      }
    } catch (err) {
      setError(err as PostgrestError);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const session = supabase.auth.getSession();
    if (!session) {
      setError({
        name: "AuthError",
        message: "Not authenticated",
        details: "",
        hint: "",
        code: "AUTH_ERROR",
      });
      setIsLoading(false);
      return;
    }

    fetchData();
  }, deps);

  return { data, error, isLoading, refetch: fetchData };
}

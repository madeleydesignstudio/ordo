import { useState, useEffect, useCallback, useRef } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { debounce } from "../utils/debounce";

export function useJournalEntry(date: string) {
  const [localContent, setLocalContent] = useState("");
  const queryClient = useQueryClient();
  const previousDateRef = useRef(date);

  const { data: entry, isLoading: isLoadingEntry } = useQuery({
    queryKey: ["journal", date],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("date", date)
        .eq("user_id", userData.user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const { mutate: saveEntry, isPending: isSaving } = useMutation({
    mutationFn: async (content: string) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error("Not authenticated");

      const { error } = await supabase.from("journal_entries").upsert(
        {
          date,
          content,
          user_id: userData.user.id,
          updated_at: new Date().toISOString(),
          created_at: entry?.created_at || new Date().toISOString(),
        },
        {
          onConflict: "user_id,date",
        }
      );

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal", date] });
    },
  });

  const debouncedSave = useCallback(
    debounce((content: string) => saveEntry(content), 1000),
    [saveEntry]
  );

  // Reset local content when date changes
  useEffect(() => {
    if (previousDateRef.current !== date) {
      setLocalContent(entry?.content || "");
      previousDateRef.current = date;
    }
  }, [date, entry]);

  // Initialize local content when entry loads
  useEffect(() => {
    if (entry && !localContent) {
      setLocalContent(entry.content || "");
    }
  }, [entry, localContent]);

  const handleContentChange = useCallback(
    (content: string) => {
      setLocalContent(content);
      debouncedSave(content);
    },
    [debouncedSave]
  );

  return {
    content: localContent,
    setContent: handleContentChange,
    isLoading: isLoadingEntry || isSaving,
  };
}

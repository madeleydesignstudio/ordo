import { useEditor, EditorContent, JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useCallback, useEffect } from "react";
import { debounce } from "../utils/debounce";
import { supabase } from "../lib/supabase";

interface EditorProps {
  noteId: string;
  initialContent: JSONContent;
  onSave?: () => void;
}

export function Editor({ noteId, initialContent, onSave }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start writing...",
      }),
    ],
    content: initialContent,
    autofocus: true,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none",
      },
    },
  });

  // Debounced save function
  const saveContent = useCallback(
    debounce(async (content: JSONContent) => {
      try {
        const { error } = await supabase
          .from("notes")
          .update({
            content,
            updated_at: new Date().toISOString(),
          })
          .eq("id", noteId);

        if (error) throw error;
        onSave?.();
      } catch (error) {
        console.error("Error saving note:", error);
      }
    }, 1000),
    [noteId]
  );

  useEffect(() => {
    if (!editor) return;

    editor.on("update", ({ editor }) => {
      const content = editor.getJSON();
      saveContent(content);
    });
  }, [editor, saveContent]);

  return (
    <div className="min-h-[500px] w-full max-w-4xl mx-auto p-4 bg-white rounded-lg shadow">
      <EditorContent editor={editor} />
    </div>
  );
}

import "@/app/tiptap.css";

import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Placeholder from "@tiptap/extension-placeholder";

import { EditorContent, useEditor } from "@tiptap/react";
import React from "react";

export default function TailwindEditor() {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Placeholder.configure({
        placeholder: "Start writing...",
      }),
    ],
  });

  return (
    <EditorContent
      className="text-xs font-light text-[#6B9CA9] h-full overflow-y-auto px-2"
      editor={editor}
    />
  );
}

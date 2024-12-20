import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";

import { EditorContent, useEditor } from "@tiptap/react";
import React from "react";

export default function TailwindEditor() {
  const editor = useEditor({
    extensions: [Document, Paragraph, Text],
    content: `
      <p>
        Start writing...
      </p>
      
    `,
  });

  return (
    <EditorContent
      className="text-xs font-light text-[#6B9CA9] h-full overflow-y-auto px-2"
      editor={editor}
    />
  );
}

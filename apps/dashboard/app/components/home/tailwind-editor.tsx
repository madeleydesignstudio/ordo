import "../../tiptap.css";

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
        // Use a placeholder:
        placeholder: "Start writing...",
        // Use different placeholders depending on the node type:
        // placeholder: ({ node }) => {
        //   if (node.type.name === 'heading') {
        //     return 'What’s the title?'
        //   }

        //   return 'Can you add some further context?'
        // },
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

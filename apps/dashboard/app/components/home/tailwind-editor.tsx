"use client";

import { EditorContent, EditorRoot, JSONContent } from "novel";
import { useState } from "react";

const TailwindEditor = () => {
  const [content, setContent] = useState<JSONContent>();

  return (
    <EditorRoot>
      <EditorContent
        initialContent={content}
        onUpdate={({ editor }) => {
          const json = editor.getJSON();
          setContent(json);
        }}
      />
    </EditorRoot>
  );
};
export default TailwindEditor;

'use client';
import {
  EditorBubbleMenu,
  EditorCharacterCount,
  EditorClearFormatting,
  EditorFloatingMenu,
  EditorFormatBold,
  EditorFormatCode,
  EditorFormatItalic,
  EditorFormatStrike,
  EditorFormatSubscript,
  EditorFormatSuperscript,
  EditorFormatUnderline,
  EditorLinkSelector,
  EditorNodeBulletList,
  EditorNodeCode,
  EditorNodeHeading1,
  EditorNodeHeading2,
  EditorNodeHeading3,
  EditorNodeOrderedList,
  EditorNodeQuote,
  EditorNodeTable,
  EditorNodeTaskList,
  EditorNodeText,
  EditorProvider,
  EditorSelector,
  EditorTableColumnAfter,
  EditorTableColumnBefore,
  EditorTableColumnDelete,
  EditorTableColumnMenu,
  EditorTableDelete,
  EditorTableFix,
  EditorTableGlobalMenu,
  EditorTableHeaderColumnToggle,
  EditorTableHeaderRowToggle,
  EditorTableMenu,
  EditorTableMergeCells,
  EditorTableRowAfter,
  EditorTableRowBefore,
  EditorTableRowDelete,
  EditorTableRowMenu,
  EditorTableSplitCell,
} from '../../kibo-ui/editor';
import type { Editor, JSONContent } from '../../kibo-ui/editor';
import { useState } from 'react';
import { Input } from "../../input";

const Notes = () => {
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<JSONContent>({
    type: 'doc',
    content: [
      { type: 'paragraph', content: [] }
    ],
  });
  
  const handleUpdate = ({ editor }: { editor: Editor }) => {
    const json = editor.getJSON();
    setContent(json);
  };
  
  return (
    <div className="flex flex-col h-[93vh]">
      {/* Title input */}
      <div className="mb-4">
        <Input 
          type="text" 
          placeholder="Enter note title..." 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-xl font-bold border-none focus:ring-0 px-0 placeholder:text-stone-400"
        />
      </div>
      
      {/* Formatting toolbar */}
      <div className="flex items-center gap-1 border-b border-stone-200 pb-3 mb-4">
        <EditorSelector title="Text">
          <EditorNodeText />
          <EditorNodeHeading1 />
          <EditorNodeHeading2 />
          <EditorNodeHeading3 />
        </EditorSelector>
        
        <div className="flex items-center gap-1">
          <button 
            onClick={() => document.execCommand('bold')}
            className="p-2 hover:bg-stone-100 rounded-md"
            title="Bold"
          >
            <EditorFormatBold hideName />
          </button>
          <button 
            onClick={() => document.execCommand('italic')}
            className="p-2 hover:bg-stone-100 rounded-md"
            title="Italic"
          >
            <EditorFormatItalic hideName />
          </button>
          <button 
            onClick={() => document.execCommand('underline')}
            className="p-2 hover:bg-stone-100 rounded-md"
            title="Underline"
          >
            <EditorFormatUnderline hideName />
          </button>
        </div>
        
        <div className="flex items-center gap-1 ml-2">
          <button 
            className="p-2 hover:bg-stone-100 rounded-md"
            title="Bullet List"
          >
            <EditorNodeBulletList hideName />
          </button>
          <button 
            className="p-2 hover:bg-stone-100 rounded-md"
            title="Numbered List"
          >
            <EditorNodeOrderedList hideName />
          </button>
          <button 
            className="p-2 hover:bg-stone-100 rounded-md"
            title="Task List"
          >
            <EditorNodeTaskList hideName />
          </button>
        </div>
      </div>
      
      {/* TipTap Editor */}
      <EditorProvider
        content={content}
        placeholder="Start writing your note..."
        className="flex-1 overflow-y-auto p-4 h-full "
        onUpdate={handleUpdate}
      >
        <EditorFloatingMenu>
          <EditorNodeHeading1 hideName />
          <EditorNodeBulletList hideName />
          <EditorNodeQuote hideName />
          <EditorNodeCode hideName />
          <EditorNodeTable hideName />
        </EditorFloatingMenu>
        
        <EditorBubbleMenu>
          <EditorSelector title="Text">
            <EditorNodeText />
            <EditorNodeHeading1 />
            <EditorNodeHeading2 />
            <EditorNodeHeading3 />
            <EditorNodeBulletList />
            <EditorNodeOrderedList />
            <EditorNodeTaskList />
            <EditorNodeQuote />
            <EditorNodeCode />
          </EditorSelector>
          <EditorSelector title="Format">
            <EditorFormatBold />
            <EditorFormatItalic />
            <EditorFormatUnderline />
            <EditorFormatStrike />
            <EditorFormatCode />
            <EditorFormatSuperscript />
            <EditorFormatSubscript />
          </EditorSelector>
          <EditorLinkSelector />
          <EditorClearFormatting />
        </EditorBubbleMenu>
        
        <EditorTableMenu>
          <EditorTableColumnMenu>
            <EditorTableColumnBefore />
            <EditorTableColumnAfter />
            <EditorTableColumnDelete />
          </EditorTableColumnMenu>
          <EditorTableRowMenu>
            <EditorTableRowBefore />
            <EditorTableRowAfter />
            <EditorTableRowDelete />
          </EditorTableRowMenu>
          <EditorTableGlobalMenu>
            <EditorTableHeaderColumnToggle />
            <EditorTableHeaderRowToggle />
            <EditorTableDelete />
            <EditorTableMergeCells />
            <EditorTableSplitCell />
            <EditorTableFix />
          </EditorTableGlobalMenu>
        </EditorTableMenu>
        
        <div className="mt-4 text-xs text-stone-500">
          <EditorCharacterCount.Words>Words: </EditorCharacterCount.Words>
        </div>
      </EditorProvider>
    </div>
  );
};

export default Notes;
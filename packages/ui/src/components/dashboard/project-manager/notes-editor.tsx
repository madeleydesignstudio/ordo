import { EditorContent, EditorContext, useEditor } from "@tiptap/react"
import * as React from "react"

// --- Tiptap Core Extensions ---
import { Highlight } from "@tiptap/extension-highlight"
import { Image } from "@tiptap/extension-image"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { TaskItem } from "@tiptap/extension-task-item"
import { TaskList } from "@tiptap/extension-task-list"
import { TextAlign } from "@tiptap/extension-text-align"
import { Typography } from "@tiptap/extension-typography"
import { Underline } from "@tiptap/extension-underline"
import { StarterKit } from "@tiptap/starter-kit"

// --- Custom Extensions ---
import { Link } from "../../tiptap/tiptap-extension/link-extension"
import { Selection } from "../../tiptap/tiptap-extension/selection-extension"
import { TrailingNode } from "../../tiptap/tiptap-extension/trailing-node-extension"

// --- UI Primitives ---
import { Button } from "../../tiptap/tiptap-ui-primitive/button"
import { Spacer } from "../../tiptap/tiptap-ui-primitive/spacer"
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "../../tiptap/tiptap-ui-primitive/toolbar"

// --- Tiptap Node ---
import "../../tiptap/tiptap-node/code-block-node/code-block-node.scss"
import "../../tiptap/tiptap-node/image-node/image-node.scss"
import { ImageUploadNode } from "../../tiptap/tiptap-node/image-upload-node/image-upload-node-extension"
import "../../tiptap/tiptap-node/list-node/list-node.scss"
import "../../tiptap/tiptap-node/paragraph-node/paragraph-node.scss"

// --- Tiptap UI ---
import { HeadingDropdownMenu } from "../../tiptap/tiptap-ui/heading-dropdown-menu"
import {
  HighlightContent,
  HighlighterButton,
  HighlightPopover,
} from "../../tiptap/tiptap-ui/highlight-popover"
import { ImageUploadButton } from "../../tiptap/tiptap-ui/image-upload-button"
import {
  LinkButton,
  LinkContent,
  LinkPopover,
} from "../../tiptap/tiptap-ui/link-popover"
import { ListDropdownMenu } from "../../tiptap/tiptap-ui/list-dropdown-menu"
import { MarkButton } from "../../tiptap/tiptap-ui/mark-button"
import { NodeButton } from "../../tiptap/tiptap-ui/node-button"
import { TextAlignButton } from "../../tiptap/tiptap-ui/text-align-button"
import { UndoRedoButton } from "../../tiptap/tiptap-ui/undo-redo-button"

// --- Icons ---
import { ArrowLeftIcon } from "../../tiptap/tiptap-icons/arrow-left-icon"
import { HighlighterIcon } from "../../tiptap/tiptap-icons/highlighter-icon"
import { LinkIcon } from "../../tiptap/tiptap-icons/link-icon"

// --- Hooks ---
import { useCursorVisibility } from "../../../hooks/use-cursor-visibility"
import { useDebouncedCallback } from "../../../hooks/use-debounce"
import { useMobile } from "../../../hooks/use-mobile"
import { useWindowSize } from "../../../hooks/use-window-size"

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from "../../../lib/tiptap-utils"

// --- Styles ---
import "../../tiptap/tiptap-templates/simple/simple-editor.scss"

// Types
interface Note {
  id: string
  title: string
  content: any
  htmlContent?: string
  plainTextContent?: string
  createdAt: Date
  updatedAt: Date
}

interface NotesEditorProps {
  note?: Note
  onSave?: (noteData: {
    title: string
    content: any
    htmlContent: string
    plainTextContent: string
  }) => Promise<void>
  onTitleChange?: (title: string) => void
  autoSave?: boolean
}

// Constants
const AUTOSAVE_DELAY = 2000; // 2 seconds

const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  isMobile,
}: {
  onHighlighterClick: () => void
  onLinkClick: () => void
  isMobile: boolean
}) => {
  return (
    <>
      <Spacer />

      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <HeadingDropdownMenu levels={[1, 2, 3, 4]} />
        <ListDropdownMenu types={["bulletList", "orderedList", "taskList"]} />
        <NodeButton type="codeBlock" />
        <NodeButton type="blockquote" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <MarkButton type="underline" />
        {!isMobile ? (
          <HighlightPopover />
        ) : (
          <HighlighterButton onClick={onHighlighterClick} />
        )}
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <ImageUploadButton text="Add" />
      </ToolbarGroup>

      <Spacer />

      {isMobile && <ToolbarSeparator />}
    </>
  )
}

const MobileToolbarContent = ({
  type,
  onBack,
}: {
  type: "highlighter" | "link"
  onBack: () => void
}) => (
  <>
    <ToolbarGroup>
      <Button data-style="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === "highlighter" ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === "highlighter" ? <HighlightContent /> : <LinkContent />}
  </>
)

// Helper function to extract plain text from HTML
const htmlToPlainText = (html: string): string => {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || div.innerText || ''
}

export function NotesEditor({
  note,
  onSave,
  onTitleChange,
  autoSave = true,
}: NotesEditorProps) {
  const isMobile = useMobile()
  const windowSize = useWindowSize()
  const [mobileView, setMobileView] = React.useState<
    "main" | "highlighter" | "link"
  >("main")
  const [title, setTitle] = React.useState(note?.title || "Untitled Note")
  const [isSaving, setIsSaving] = React.useState(false)
  const [lastSaved, setLastSaved] = React.useState<Date | null>(null)
  const [contentChanged, setContentChanged] = React.useState(false)
  const toolbarRef = React.useRef<HTMLDivElement>(null)
  
  // Track if the editor is currently focused to prevent autosave from interrupting typing
  const [isEditorFocused, setIsEditorFocused] = React.useState(false)
  
  // Track if we're currently creating a list to prevent autosave during list creation
  const isCreatingListRef = React.useRef(false)

  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area, start typing to enter text.",
      },
      handleKeyDown: (view, event) => {
        // Detect when user is creating or modifying a list
        if (event.key === 'Enter' && (
          editor?.isActive('bulletList') || 
          editor?.isActive('orderedList') || 
          editor?.isActive('taskList')
        )) {
          isCreatingListRef.current = true;
          // Reset the flag after a short delay
          setTimeout(() => {
            isCreatingListRef.current = false;
          }, 500);
        }
        return false; // Let TipTap handle the event
      },
    },
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
        
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Underline,
      TaskList.configure({
        HTMLAttributes: {
          class: 'task-list',
        },
      }),
      TaskItem.configure({ 
        nested: true,
        HTMLAttributes: {
          class: 'task-item',
        },
      }),
      Highlight.configure({ multicolor: true }),
      Image,
      Typography,
      Superscript,
      Subscript,

      Selection,
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: handleImageUpload,
        onError: (error) => console.error("Upload failed:", error),
      }),
      TrailingNode,
      Link.configure({ openOnClick: false }),
    ],
    content: note?.content || { type: 'doc', content: [{ type: 'paragraph' }] },
    onUpdate: () => {
      // Only mark as changed, the actual save will be debounced
      setContentChanged(true);
    },
    onFocus: () => {
      setIsEditorFocused(true);
    },
    onBlur: () => {
      setIsEditorFocused(false);
      // When focus leaves the editor, we can save if there are changes
      if (contentChanged && autoSave) {
        debouncedSave();
      }
    },
  })

  const bodyRect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  })

  // Perform the actual save operation
  const performSave = React.useCallback(async () => {
    if (!editor || !onSave || !contentChanged) return;
    
    // Don't save if we're in the middle of creating a list
    if (isCreatingListRef.current) {
      return;
    }

    setIsSaving(true);
    try {
      const content = editor.getJSON();
      const htmlContent = editor.getHTML();
      const plainTextContent = htmlToPlainText(htmlContent);

      await onSave({
        title,
        content,
        htmlContent,
        plainTextContent,
      });

      setLastSaved(new Date());
      setContentChanged(false);
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setIsSaving(false);
    }
  }, [editor, onSave, title, contentChanged]);

  // Create a debounced version of the save function
  const debouncedSave = useDebouncedCallback(performSave, AUTOSAVE_DELAY);

  // Handle title changes
  const handleTitleChange = React.useCallback((newTitle: string) => {
    setTitle(newTitle);
    onTitleChange?.(newTitle);
    setContentChanged(true);
    
    if (autoSave) {
      debouncedSave();
    }
  }, [onTitleChange, autoSave, debouncedSave]);

  // Handle autosave when content changes
  React.useEffect(() => {
    if (!autoSave || !contentChanged) return;
    
    // Only trigger autosave if the user isn't currently focused in the editor
    // This prevents interrupting typing with saves
    if (!isEditorFocused) {
      debouncedSave();
    }
  }, [contentChanged, autoSave, isEditorFocused, debouncedSave]);

  // Manual save button handler
  const handleManualSave = React.useCallback(() => {
    performSave();
  }, [performSave]);

  // Mobile view handling
  React.useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      setMobileView("main");
    }
  }, [isMobile, mobileView]);

  // Update editor content when note changes
  React.useEffect(() => {
    if (editor && note?.content) {
      editor.commands.setContent(note.content);
      setTitle(note.title || "Untitled Note");
      setContentChanged(false);
    }
  }, [editor, note]);

  return (
    <div className="notes-editor flex flex-col h-full ">
      {/* Title Input - Fixed section */}
      <div className="px-4 pt-4 pb-2 flex-shrink-0  border-b border-gray-100">
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="w-full text-2xl font-bold bg-transparent border-none outline-none resize-none"
          placeholder="Untitled Note"
        />
        
        {/* Save Status */}
        <div className="flex items-center justify-between mt-2 mb-2 text-sm text-gray-500">
          <div>
            {isSaving && <span>Saving...</span>}
            {lastSaved && !isSaving && (
              <span>Saved {lastSaved.toLocaleTimeString()}</span>
            )}
            {contentChanged && !isSaving && (
              <span>Unsaved changes</span>
            )}
          </div>
          
          {/* Always show manual save button */}
          <button 
            onClick={handleManualSave}
            className="px-3 py-1 rounded bg-blue-500 text-white text-sm hover:bg-blue-600 transition-colors"
            disabled={isSaving || (!contentChanged && !!lastSaved)}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <EditorContext.Provider value={{ editor }}>
        {/* Toolbar - Fixed section */}
        <div className="flex-shrink-0 border-b border-gray-100">
          <Toolbar
            ref={toolbarRef}
            style={
              isMobile
                ? {
                    bottom: `calc(100% - ${windowSize.height - bodyRect.y}px)`,
                  }
                : {}
            }
            className="flex-shrink-0"
          >
            {mobileView === "main" ? (
              <MainToolbarContent
                onHighlighterClick={() => setMobileView("highlighter")}
                onLinkClick={() => setMobileView("link")}
                isMobile={isMobile}
              />
            ) : (
              <MobileToolbarContent
                type={mobileView === "highlighter" ? "highlighter" : "link"}
                onBack={() => setMobileView("main")}
              />
            )}
          </Toolbar>
        </div>

        {/* Content - This is the ONLY scrollable part */}
        <div className="flex-grow overflow-y-auto">
          <div className="editor-container py-4 px-4">
            <EditorContent
              editor={editor}
              role="presentation"
              className="simple-editor-content"
            />
          </div>
        </div>
      </EditorContext.Provider>
    </div>
  )
}
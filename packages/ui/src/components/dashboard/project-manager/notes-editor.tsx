import * as React from "react"
import { EditorContent, EditorContext, useEditor } from "@tiptap/react"

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit"
import { Image } from "@tiptap/extension-image"
import { TaskItem } from "@tiptap/extension-task-item"
import { TaskList } from "@tiptap/extension-task-list"
import { TextAlign } from "@tiptap/extension-text-align"
import { Typography } from "@tiptap/extension-typography"
import { Highlight } from "@tiptap/extension-highlight"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { Underline } from "@tiptap/extension-underline"

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
import { ImageUploadNode } from "../../tiptap/tiptap-node/image-upload-node/image-upload-node-extension"
import "../../tiptap/tiptap-node/code-block-node/code-block-node.scss"
import "../../tiptap/tiptap-node/list-node/list-node.scss"
import "../../tiptap/tiptap-node/image-node/image-node.scss"
import "../../tiptap/tiptap-node/paragraph-node/paragraph-node.scss"

// --- Tiptap UI ---
import { HeadingDropdownMenu } from "../../tiptap/tiptap-ui/heading-dropdown-menu"
import { ImageUploadButton } from "../../tiptap/tiptap-ui/image-upload-button"
import { ListDropdownMenu } from "../../tiptap/tiptap-ui/list-dropdown-menu"
import { NodeButton } from "../../tiptap/tiptap-ui/node-button"
import {
  HighlightPopover,
  HighlightContent,
  HighlighterButton,
} from "../../tiptap/tiptap-ui/highlight-popover"
import {
  LinkPopover,
  LinkContent,
  LinkButton,
} from "../../tiptap/tiptap-ui/link-popover"
import { MarkButton } from "../../tiptap/tiptap-ui/mark-button"
import { TextAlignButton } from "../../tiptap/tiptap-ui/text-align-button"
import { UndoRedoButton } from "../../tiptap/tiptap-ui/undo-redo-button"

// --- Icons ---
import { ArrowLeftIcon } from "../../tiptap/tiptap-icons/arrow-left-icon"
import { HighlighterIcon } from "../../tiptap/tiptap-icons/highlighter-icon"
import { LinkIcon } from "../../tiptap/tiptap-icons/link-icon"

// --- Hooks ---
import { useMobile } from "../../../hooks/use-mobile"
import { useWindowSize } from "../../../hooks/use-window-size"
import { useCursorVisibility } from "../../../hooks/use-cursor-visibility"

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
  const toolbarRef = React.useRef<HTMLDivElement>(null)

  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area, start typing to enter text.",
      },
    },
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Underline,
      TaskList,
      TaskItem.configure({ nested: true }),
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
  })

  const bodyRect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  })

  // Auto-save function
  const performSave = React.useCallback(async () => {
    if (!editor || !onSave) return

    setIsSaving(true)
    try {
      const content = editor.getJSON()
      const htmlContent = editor.getHTML()
      const plainTextContent = htmlToPlainText(htmlContent)

      await onSave({
        title,
        content,
        htmlContent,
        plainTextContent,
      })

      setLastSaved(new Date())
    } catch (error) {
      console.error('Failed to save note:', error)
    } finally {
      setIsSaving(false)
    }
  }, [editor, onSave, title])

  // Handle title changes
  const handleTitleChange = React.useCallback((newTitle: string) => {
    setTitle(newTitle)
    onTitleChange?.(newTitle)
    if (autoSave) {
      performSave()
    }
  }, [onTitleChange, autoSave, performSave])

  // Handle editor content changes
  React.useEffect(() => {
    if (!editor || !autoSave) return

    const handleUpdate = () => {
      performSave()
    }

    editor.on('update', handleUpdate)
    return () => {
      editor.off('update', handleUpdate)
    }
  }, [editor, autoSave, performSave])

  // Mobile view handling
  React.useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      setMobileView("main")
    }
  }, [isMobile, mobileView])

  // Update editor content when note changes
  React.useEffect(() => {
    if (editor && note?.content) {
      editor.commands.setContent(note.content)
      setTitle(note.title || "Untitled Note")
    }
  }, [editor, note])

  return (
    <div className="notes-editor">
      {/* Title Input */}
      <div className="mb-4 px-4 pt-4">
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="w-full text-2xl font-bold bg-transparent border-none outline-none resize-none"
          placeholder="Untitled Note"
        />
        
        {/* Save Status */}
        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
          {isSaving && <span>Saving...</span>}
          {lastSaved && !isSaving && (
            <span>Saved {lastSaved.toLocaleTimeString()}</span>
          )}
        </div>
      </div>

      <EditorContext.Provider value={{ editor }}>
        <Toolbar
          ref={toolbarRef}
          style={
            isMobile
              ? {
                  bottom: `calc(100% - ${windowSize.height - bodyRect.y}px)`,
                }
              : {}
          }
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

        <div className="content-wrapper">
          <EditorContent
            editor={editor}
            role="presentation"
            className="simple-editor-content"
          />
        </div>
      </EditorContext.Provider>
    </div>
  )
}
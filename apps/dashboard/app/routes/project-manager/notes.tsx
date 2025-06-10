import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { NotesEditor } from '@workspace/ui/components/dashboard/project-manager/notes-editor'
import { trpc } from '../../lib/trpc'
import { useState, useEffect } from 'react'
import { Button } from '@workspace/ui/components/button'
import { PlusIcon, FolderIcon, SearchIcon } from 'lucide-react'
import { useUser } from '../../routes/__root'

// Search params type
type NotesSearch = {
  noteId?: string
  folderId?: string
}

export const Route = createFileRoute('/project-manager/notes')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): NotesSearch => {
    return {
      noteId: typeof search.noteId === 'string' ? search.noteId : undefined,
      folderId: typeof search.folderId === 'string' ? search.folderId : undefined,
    }
  },
})

function RouteComponent() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/project-manager/notes' })
  const [currentNote, setCurrentNote] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Get authenticated user
  const user = useUser()
  const isAuthenticated = !!user?.id
  
  // tRPC queries and mutations
  const { data: notes, refetch: refetchNotes } = trpc.notes.list.useQuery({
    folderId: search.folderId,
    search: searchQuery || undefined,
  }, {
    enabled: isAuthenticated
  })
  
  const { data: folders } = trpc.notes.folders.list.useQuery(undefined, {
    enabled: isAuthenticated
  })
  
  const { data: noteData } = trpc.notes.getById.useQuery(
    { id: search.noteId! },
    { enabled: !!search.noteId && isAuthenticated }
  )
  
  const createNoteMutation = trpc.notes.create.useMutation({
    onSuccess: (newNote) => {
      if (newNote) {
        navigate({
          to: '/project-manager/notes',
          search: { noteId: newNote.id },
        })
      }
      refetchNotes()
    },
  })
  
  const updateNoteMutation = trpc.notes.update.useMutation({
    onSuccess: () => {
      refetchNotes()
    },
  })
  
  const createFolderMutation = trpc.notes.folders.create.useMutation({
    onSuccess: () => {
      // Refresh folders list
    },
  })
  
  // Update current note when noteData changes
  useEffect(() => {
    if (noteData) {
      setCurrentNote(noteData)
    }
  }, [noteData])
  
  // Handle creating a new note
  const handleCreateNote = async () => {
    if (!isAuthenticated) return;
    
    await createNoteMutation.mutateAsync({
      title: 'Untitled Note',
      folderId: search.folderId,
    })
  }
  
  // Handle saving note changes
  const handleSaveNote = async (noteData: {
    title: string
    content: any
    htmlContent: string
    plainTextContent: string
  }) => {
    if (!isAuthenticated) return;
    
    if (!currentNote) {
      // Create new note if none exists
      const newNote = await createNoteMutation.mutateAsync({
        ...noteData,
        folderId: search.folderId,
      })
      setCurrentNote(newNote)
    } else {
      // Update existing note
      await updateNoteMutation.mutateAsync({
        id: currentNote.id,
        ...noteData,
      })
    }
  }
  
  // Handle note selection
  const handleSelectNote = (noteId: string) => {
    navigate({
      to: '/project-manager/notes',
      search: { noteId, folderId: search.folderId },
    })
  }
  
  // If no user is authenticated, show message
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h3 className="text-xl font-medium mb-2">Authentication Required</h3>
          <p>Please log in to access your notes.</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className='flex h-screen'>
      {/* Sidebar - Folders */}
      <div className='w-2/12 border-r border-stone-300 p-4'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='font-semibold'>Folders</h3>
          <Button
            size='sm'
            variant='ghost'
            onClick={() => {
              const name = prompt('Folder name:')
              if (name) {
                createFolderMutation.mutate({ name })
              }
            }}
          >
            <PlusIcon className='h-4 w-4' />
          </Button>
        </div>
        
        <div className='space-y-1'>
          <button
            onClick={() => navigate({ to: '/project-manager/notes', search: {} })}
            className={`w-full text-left p-2 rounded hover:bg-gray-100 flex items-center gap-2 ${
              !search.folderId ? 'bg-blue-50 text-blue-600' : ''
            }`}
          >
            <FolderIcon className='h-4 w-4' />
            All Notes
          </button>
          
          {folders?.map((folder) => (
            <button
              key={folder.id}
              onClick={() =>
                navigate({
                  to: '/project-manager/notes',
                  search: { folderId: folder.id },
                })
              }
              className={`w-full text-left p-2 rounded hover:bg-gray-100 flex items-center gap-2 ${
                search.folderId === folder.id ? 'bg-blue-50 text-blue-600' : ''
              }`}
            >
              <FolderIcon className='h-4 w-4' style={{ color: folder.color || '#6366f1' }} />
              {folder.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Sidebar - Notes List */}
      <div className='w-3/12 border-r border-stone-300 p-4'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='font-semibold'>Notes</h3>
          <Button size='sm' onClick={handleCreateNote}>
            <PlusIcon className='h-4 w-4' />
          </Button>
        </div>
        
        {/* Search */}
        <div className='relative mb-4'>
          <SearchIcon className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
          <input
            type='text'
            placeholder='Search notes...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full pl-10 pr-4 py-2 border rounded-md'
          />
        </div>
        
        {/* Notes List */}
        <div className='space-y-2'>
          {notes?.map((note) => (
            <button
              key={note.id}
              onClick={() => handleSelectNote(note.id)}
              className={`w-full text-left p-3 rounded-md border hover:bg-gray-50 ${
                search.noteId === note.id ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <h4 className='font-medium truncate'>{note.title}</h4>
              <p className='text-sm text-gray-500 mt-1'>
                {new Date(note.updatedAt).toLocaleDateString()}
              </p>
              {note.plainTextContent && (
                <p className='text-sm text-gray-600 mt-1 line-clamp-2'>
                  {note.plainTextContent.substring(0, 100)}...
                </p>
              )}
            </button>
          ))}
          
          {notes?.length === 0 && (
            <div className='text-center py-8 text-gray-500'>
              No notes found. Create your first note!
            </div>
          )}
        </div>
      </div>
      
      {/* Main Editor */}
      <div className='w-7/12'>
        {currentNote || search.noteId ? (
          <div className='max-w-5xl mx-auto h-full'>
            <NotesEditor
              note={currentNote}
              onSave={handleSaveNote}
              autoSave={true}
              autoSaveDelay={1000}
            />
          </div>
        ) : (
          <div className='flex items-center justify-center h-full text-gray-500'>
            <div className='text-center'>
              <h3 className='text-xl font-medium mb-2'>Select a note to edit</h3>
              <p className='mb-4'>Choose a note from the sidebar or create a new one.</p>
              <Button onClick={handleCreateNote}>
                <PlusIcon className='h-4 w-4 mr-2' />
                Create New Note
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

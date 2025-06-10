import { createFileRoute } from '@tanstack/react-router'
import { SimpleEditor } from '@workspace/ui/components/dashboard/project-manager/notes'

export const Route = createFileRoute('/project-manager/notes')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div className='flex'>
    <div className='w-2/12'>Hello</div>
    <div className='w-3/12 border-l border-stone-300'>Hello</div>
    <div className='w-9/12 border-l border-stone-300 '>
    
    <div className='max-w-5xl mx-auto h-full'><SimpleEditor/></div>
   </div>
    </div>
}

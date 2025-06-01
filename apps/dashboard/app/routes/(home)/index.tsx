// app/routes/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'


export const Route = createFileRoute('/(home)/')({
  component: Home,
})

function Home() {
 

  return (
   <div>
    <h1>Home</h1>
    <Button>Click me</Button>
   </div>
  )
}
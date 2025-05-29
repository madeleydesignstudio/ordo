// app/routes/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@ordo/ui-web/components/button'


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
// app/routes/index.tsx
import { createFileRoute } from '@tanstack/react-router'


export const Route = createFileRoute('/(home)/')({
  component: Dashboard,
})

function Dashboard() {


  return (
    <div >
      s
    </div>
  )
}
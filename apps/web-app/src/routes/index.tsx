// src/routes/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from '../components/Dashboard'





export const Route = createFileRoute('/')({
  component: Dashboard,
})

function Home() {


  return (
   <div>
    <h1>Home</h1>
   </div>
  )
}
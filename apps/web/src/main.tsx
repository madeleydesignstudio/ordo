import ReactDOM from 'react-dom/client'

import { App } from './Root.tsx'
import '@/index.css'
import React from 'react'


ReactDOM.createRoot(document.getElementById('Ordo')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

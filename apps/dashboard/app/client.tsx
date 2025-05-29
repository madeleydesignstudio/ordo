// app/client.tsx
/// <reference types="vinxi/types/client" />
import React from 'react'
import { hydrateRoot } from 'react-dom/client'
import { StartClient } from '@tanstack/react-start'
import { createRouter } from './router'
import { PostHogProvider } from 'posthog-js/react'


const router = createRouter()



hydrateRoot(
  document,
  <React.StrictMode>
    <PostHogProvider
      apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
      options={{
        api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
        ui_host: import.meta.env.VITE_PUBLIC_POSTHOG_UI_HOST,
        capture_exceptions: true,
        debug: import.meta.env.MODE === 'development',
        disable_external_dependency_loading: true,
      }}
    >
      <StartClient router={router} />
    </PostHogProvider>
  </React.StrictMode>
)

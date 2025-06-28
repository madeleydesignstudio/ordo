// src/routes/__root.tsx
/// <reference types="vite/client" />
import type { ReactNode } from 'react'
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
  Link,
} from '@tanstack/react-router'
import {
  ClerkProvider,
} from '@clerk/tanstack-react-start'
import { Providers } from '../lib/providers'
import appCss from '../index.css?url'

// Get the publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY environment variable')
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Ordo - Task Management',
      },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'preload', href: appCss, as: 'style' },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
})

function RootComponent() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <RootDocument>
        <Providers>
          <Outlet />
        </Providers>
      </RootDocument>
    </ClerkProvider>
  )
}

function NotFoundComponent() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <RootDocument>
        <Providers>
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
              <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
              <Link 
                to="/" 
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go Home
              </Link>
            </div>
          </div>
        </Providers>
      </RootDocument>
    </ClerkProvider>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
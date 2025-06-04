import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import { useState } from 'react'
import { trpc } from '../lib/trpc'

interface TRPCProviderProps {
  children: React.ReactNode
}

export function TRPCProvider({ children }: TRPCProviderProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
    },
  }))

  // Use consistent environment detection with auth client
  const isDevelopment = 
    (typeof window !== 'undefined' && window.location.hostname === 'localhost') ||
    (typeof import.meta.env !== 'undefined' && import.meta.env.DEV);

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: isDevelopment 
            ? (import.meta.env.VITE_ENGINE_DEV_URL || 'http://localhost:4321') + '/trpc'
            : (import.meta.env.VITE_ENGINE_PROD_URL || 'https://engine.dev-0af.workers.dev') + '/trpc',
          headers() {
            return {
              'Content-Type': 'application/json',
            }
          },
          fetch(url, options) {
            return fetch(url, {
              ...options,
              credentials: 'include', // Include cookies in cross-origin requests
            })
          },
        }),
      ],
    })
  )

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  )
} 
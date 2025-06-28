import { useAuth } from '@clerk/tanstack-react-start'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { trpc, createTRPCClient } from './trpc'

// Initialize React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})

function TRPCProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth()
  const [trpcClient] = useState(() => createTRPCClient(getToken))
  
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children as any}
      </QueryClientProvider>
    </trpc.Provider>
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TRPCProvider>
      {children}
    </TRPCProvider>
  )
} 
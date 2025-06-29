import { createTRPCReact } from '@trpc/react-query'
import { httpBatchLink } from '@trpc/client'
import type { AppRouter } from '@ordo/backend/src/trpc/router'

export const trpc = createTRPCReact<AppRouter>()

export const createTRPCClient = (getToken: () => Promise<string | null>) => {
  // Use the new ngrok tunnel URL
  const apiUrl = 'https://ce0c-94-7-8-23.ngrok-free.app/trpc'
  
  console.log('🚀 Mobile app connecting to API:', apiUrl)
  
  return trpc.createClient({
    transformer: undefined,
    links: [
      httpBatchLink({
        url: apiUrl,
        async headers() {
          const token = await getToken()
          return {
            authorization: token ? `Bearer ${token}` : '',
            'ngrok-skip-browser-warning': 'true',
            'Content-Type': 'application/json',
          }
        },
      }),
    ],
  })
}
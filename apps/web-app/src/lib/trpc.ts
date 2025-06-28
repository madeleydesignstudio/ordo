import { createTRPCReact } from '@trpc/react-query'
import { httpBatchLink } from '@trpc/client'
import type { AppRouter } from '@ordo/backend/src/trpc/router'

export const trpc = createTRPCReact<AppRouter>()

export const createTRPCClient = (getToken: () => Promise<string | null>) => {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: 'http://localhost:8787/trpc',
        async headers() {
          const token = await getToken()
          return {
            authorization: token ? `Bearer ${token}` : '',
          }
        },
      }),
    ],
  })
} 
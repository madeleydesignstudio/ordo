import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '@ordo/trpc'

// Create typed tRPC React hooks
export const trpc = createTRPCReact<AppRouter>()

// Export the AppRouter type for use in other files
export type { AppRouter } 
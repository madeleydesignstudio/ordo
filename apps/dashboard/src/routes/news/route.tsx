import { createFileRoute, Outlet } from '@tanstack/react-router'
import { queryClient } from '~/lib/client/query-client'
import { fetchNews } from '~/lib/client/news'

export const Route = createFileRoute('/news')({
  component: NewsLayout,
  loader: async () => {
    // Prefetch the news data
    await queryClient.prefetchQuery({
      queryKey: ['news'],
      queryFn: fetchNews,
    })
    return {}
  },
})

function NewsLayout() {
  return <Outlet />
}

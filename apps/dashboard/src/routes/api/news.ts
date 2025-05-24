import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { auth } from '~/lib/server/auth'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { db } from '~/lib/server/db'
import { user } from '~/lib/server/schema/auth.schema'
import { eq } from 'drizzle-orm'

const CURRENTS_API_KEY = process.env.CURRENTS_API_KEY
const CURRENTS_API_URL = 'https://api.currentsapi.services/v1'

// Initialize Upstash Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Create a rate limiter that allows 20 requests per day
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(50, '24h'),
  analytics: true,
})

// Cache key for storing news data
const NEWS_CACHE_KEY = 'news:latest'

export const APIRoute = createAPIFileRoute('/api/news')({
  GET: async ({ request }) => {
    try {
      // Check authentication
      const session = await auth.api.getSession({ headers: request.headers })
      if (!session?.user?.id) {
        return json({ error: 'Unauthorized' }, { status: 401 })
      }

      // Try to get cached news data first
      const cachedNews = await redis.get(NEWS_CACHE_KEY)
      if (cachedNews) {
        return json(cachedNews, {
          headers: {
            'Cache-Control': 'public, max-age=3600', // 1 hour cache
            'X-Cache': 'HIT'
          }
        })
      }

      // Get user's profile to get their country
      const [userProfile] = await db.select().from(user).where(eq(user.id, session.user.id))
      const userCountry = userProfile?.country || 'US'

      // Check rate limit
      const { success, limit, reset, remaining } = await ratelimit.limit(session.user.id)
      
      if (!success) {
        // If rate limited, try to return cached data even if it's stale
        const staleCache = await redis.get(NEWS_CACHE_KEY)
        if (staleCache) {
          return json(staleCache, {
            headers: {
              'Cache-Control': 'public, max-age=3600',
              'X-Cache': 'STALE',
              'X-RateLimit-Limit': limit.toString(),
              'X-RateLimit-Remaining': remaining.toString(),
              'X-RateLimit-Reset': reset.toString()
            }
          })
        }

        return json({ 
          error: 'Rate limit exceeded',
          message: 'You can only fetch news 20 times per day',
          reset: new Date(reset).toISOString()
        }, { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString()
          }
        })
      }

      if (!CURRENTS_API_KEY) {
        throw new Error('CURRENTS_API_KEY is not configured in environment variables')
      }

      // Get optional keywords from query params
      const url = new URL(request.url)
      const keywords = url.searchParams.get('keywords')

      // Log the first few characters of the API key to verify it's being loaded (for debugging)
      console.log('API Key prefix:', CURRENTS_API_KEY.substring(0, 4) + '...')

      // Construct URL with query parameters
      const apiUrl = new URL(`${CURRENTS_API_URL}/latest-news`)
      apiUrl.searchParams.append('language', 'en')
      apiUrl.searchParams.append('apiKey', CURRENTS_API_KEY)
      apiUrl.searchParams.append('country', userCountry)
      if (keywords) {
        apiUrl.searchParams.append('keywords', keywords)
      }

      console.log('Fetching news from:', apiUrl.toString())

      // Create a new Request object as shown in the documentation
      const req = new Request(apiUrl.toString())
      const response = await fetch(req)

      if (!response.ok) {
        const errorData = await response.text()
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
        })
        throw new Error(`Failed to fetch news: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      // Check if the response has the expected format
      if (data.status !== 'ok' || !data.news) {
        console.error('Unexpected API response format:', data)
        throw new Error('Unexpected response format from Currents API')
      }

      // Cache the news data for 1 hour
      await redis.set(NEWS_CACHE_KEY, data, { ex: 3600 })

      return json(data, {
        headers: {
          'Cache-Control': 'public, max-age=3600',
          'X-Cache': 'MISS',
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString()
        }
      })
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('News API Error:', errorMessage)
      return json(
        { error: 'Failed to fetch news', details: errorMessage },
        { status: 500 }
      )
    }
  },
})

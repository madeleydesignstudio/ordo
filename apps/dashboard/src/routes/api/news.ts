import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { auth } from "~/lib/server/auth";
import fs from 'fs/promises';
import path from 'path';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const CACHE_FILE = path.join(process.cwd(), '.news-cache.json');

// Initialize Upstash Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Create a rate limiter that allows 1 request per day
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(1, '24h'),
  analytics: true,
});

// Cache for storing the daily news
let cachedNews: {
  headline: string;
  summary: string;
  timestamp: number;
} | null = null;

// Load cache from file
const loadCache = async () => {
  try {
    const data = await fs.readFile(CACHE_FILE, 'utf-8');
    cachedNews = JSON.parse(data);
  } catch (error) {
    console.error('Failed to load news cache:', error);
    // If file doesn't exist or is invalid, start with null cache
    cachedNews = null;
  }
};

// Save cache to file
const saveCache = async (news: typeof cachedNews) => {
  try {
    await fs.writeFile(CACHE_FILE, JSON.stringify(news));
  } catch (error) {
    console.error('Failed to save news cache:', error);
  }
};

// Function to check if cache is valid (less than 24 hours old)
const isCacheValid = () => {
  if (!cachedNews) return false;
  const now = Date.now();
  const cacheAge = now - cachedNews.timestamp;
  return cacheAge < 24 * 60 * 60 * 1000; // 24 hours in milliseconds
};

// Function to fetch news from Perplexity
const fetchNewsFromPerplexity = async () => {
  if (!process.env.PERPLEXITY_API_KEY) {
    throw new Error('Missing PERPLEXITY_API_KEY');
  }

  const options = {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: "sonar",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that provides news headlines and summaries. Always respond in valid JSON format with 'headline' and 'summary' fields."
        },
        {
          role: "user",
          content: "Give me a brief, interesting news headline from today with a one-sentence summary."
        }
      ],
      max_tokens: 200,
      temperature: 0.2,
      top_p: 0.9,
      search_domain_filter: ["news.com", "reuters.com", "bbc.com"],
      return_images: false,
      return_related_questions: false,
      search_recency_filter: "day",
      top_k: 0,
      stream: false,
      presence_penalty: 0,
      frequency_penalty: 1,
      web_search_options: {
        search_context_size: "low"
      }
    })
  };

  const response = await fetch('https://api.perplexity.ai/chat/completions', options);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Perplexity API error: ${errorText}`);
  }

  const data = await response.json();
  
  if (!data.choices?.[0]?.message?.content) {
    throw new Error('Unexpected response format from Perplexity API');
  }
  
  const content = data.choices[0].message.content;
  
  try {
    const parsedContent = JSON.parse(content);
    // Clean and format the content
    const headline = parsedContent.headline.replace(/["{}]/g, '').trim();
    const summary = parsedContent.summary.replace(/["{}]/g, '').trim();
    
    return {
      headline,
      summary,
      timestamp: Date.now()
    };
  } catch (parseError) {
    console.error('Failed to parse news content:', parseError);
    // Clean the raw content
    const cleanContent = content.replace(/["{}]/g, '').trim();
    return {
      headline: "Latest News",
      summary: cleanContent,
      timestamp: Date.now()
    };
  }
};

export const APIRoute = createAPIFileRoute("/api/news")({
  GET: async ({ request }) => {
    try {
      // Load cache if not already loaded
      if (!cachedNews) {
        await loadCache();
      }

      // Check authentication
      const session = await auth.api.getSession({ headers: request.headers });
      if (!session?.user?.id) {
        return json({ error: "Unauthorized" }, { status: 401 });
      }

      // Check rate limit
      const { success, limit, reset, remaining } = await ratelimit.limit(session.user.id);
      
      if (!success) {
        return json({ 
          error: "Rate limit exceeded",
          message: "You can only fetch news once per day",
          reset: new Date(reset).toISOString()
        }, { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString()
          }
        });
      }

      // Check if we have valid cached news
      if (isCacheValid() && cachedNews) {
        return json(cachedNews, {
          headers: {
            'Cache-Control': 'public, max-age=86400',
            'X-Cache': 'HIT',
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString()
          }
        });
      }

      // Fetch new news if cache is invalid
      const news = await fetchNewsFromPerplexity();
      cachedNews = news;
      await saveCache(news);

      return json(news, {
        headers: {
          'Cache-Control': 'public, max-age=86400',
          'X-Cache': 'MISS',
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString()
        }
      });
    } catch (error) {
      console.error("Error in news API:", error);
      return json({ 
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error)
      }, { status: 500 });
    }
  },
  POST: async ({ request }) => {
    // Reuse the same logic as GET
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check rate limit
    const { success, limit, reset, remaining } = await ratelimit.limit(session.user.id);
    
    if (!success) {
      return json({ 
        error: "Rate limit exceeded",
        message: "You can only fetch news once per day",
        reset: new Date(reset).toISOString()
      }, { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString()
        }
      });
    }

    if (isCacheValid() && cachedNews) {
      return json(cachedNews, {
        headers: {
          'Cache-Control': 'public, max-age=86400',
          'X-Cache': 'HIT',
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString()
        }
      });
    }

    const news = await fetchNewsFromPerplexity();
    cachedNews = news;
    await saveCache(news);

    return json(news, {
      headers: {
        'Cache-Control': 'public, max-age=86400',
        'X-Cache': 'MISS',
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': reset.toString()
      }
    });
  }
});

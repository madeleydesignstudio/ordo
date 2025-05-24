import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { auth } from "~/lib/server/auth";

export const APIRoute = createAPIFileRoute("/api/news")({
  GET: async ({ request }) => {
    try {
      console.log('News API called');
      
      // Check authentication
      const session = await auth.api.getSession({ headers: request.headers });
      console.log('Session check:', !!session?.user?.id);
      
      if (!session?.user?.id) {
        return json({ error: "Unauthorized" }, { status: 401 });
      }

      // Verify API key
      if (!process.env.PERPLEXITY_API_KEY) {
        console.error('Missing PERPLEXITY_API_KEY');
        return json({ error: "API configuration error" }, { status: 500 });
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

      console.log('Making request to Perplexity...');
      const response = await fetch('https://api.perplexity.ai/chat/completions', options);
      
      console.log('Perplexity response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Perplexity API error:', errorText);
        return json({ 
          error: "Failed to fetch from Perplexity API",
          status: response.status,
          details: errorText
        }, { status: response.status });
      }

      const data = await response.json();
      console.log('Perplexity response structure:', Object.keys(data));
      
      if (!data.choices?.[0]?.message?.content) {
        console.error('Unexpected response structure:', data);
        return json({ 
          error: "Unexpected response format from Perplexity API",
          response: data
        }, { status: 500 });
      }
      
      const content = data.choices[0].message.content;
      console.log('Content to parse:', content);
      
      try {
        const parsedContent = JSON.parse(content);
        return json(parsedContent);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        // Return the raw content if JSON parsing fails
        return json({ 
          headline: "News Update",
          summary: content 
        });
      }
    } catch (error) {
      console.error("Error in news API:", error);
      return json({ 
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error)
      }, { status: 500 });
    }
  },
  POST: async ({ request }) => {
    try {
      console.log('News API called');
      
      // Check authentication
      const session = await auth.api.getSession({ headers: request.headers });
      console.log('Session check:', !!session?.user?.id);
      
      if (!session?.user?.id) {
        return json({ error: "Unauthorized" }, { status: 401 });
      }

      // Verify API key
      if (!process.env.PERPLEXITY_API_KEY) {
        console.error('Missing PERPLEXITY_API_KEY');
        return json({ error: "API configuration error" }, { status: 500 });
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
          // Remove or fix response_format
          // response_format: { type: "json_object" },
          web_search_options: {
            search_context_size: "low"
          }
        })
      };

      console.log('Making request to Perplexity...');
      const response = await fetch('https://api.perplexity.ai/chat/completions', options);
      
      console.log('Perplexity response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Perplexity API error:', errorText);
        return json({ 
          error: "Failed to fetch from Perplexity API",
          status: response.status,
          details: errorText
        }, { status: response.status });
      }

      const data = await response.json();
      console.log('Perplexity response structure:', Object.keys(data));
      
      if (!data.choices?.[0]?.message?.content) {
        console.error('Unexpected response structure:', data);
        return json({ 
          error: "Unexpected response format from Perplexity API",
          response: data
        }, { status: 500 });
      }
      
      const content = data.choices[0].message.content;
      console.log('Content to parse:', content);
      
      try {
        const parsedContent = JSON.parse(content);
        return json(parsedContent);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        // Return the raw content if JSON parsing fails
        return json({ 
          headline: "News Update",
          summary: content 
        });
      }
    } catch (error) {
      console.error("Error in news API:", error);
      return json({ 
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error)
      }, { status: 500 });
    }
  }
});

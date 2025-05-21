import { useQuery } from "@tanstack/react-query";

interface NewsItem {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

const fetchNews = async () => {
  const apiKey = import.meta.env.VITE_FINNHUB_API_KEY;
  
  if (!apiKey) {
    console.error('Finnhub API key is not configured');
    throw new Error('API key not configured');
  }

  // Log the first few characters of the API key to verify format (for debugging)
  console.log('API Key format check:', {
    length: apiKey.length,
    startsWith: apiKey.substring(0, 4),
    format: /^[a-zA-Z0-9]+$/.test(apiKey) ? 'valid' : 'invalid'
  });

  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/news?category=general&token=${apiKey}`
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Finnhub API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        url: response.url.replace(apiKey, 'REDACTED') // Log URL with redacted API key
      });
      throw new Error(`Failed to fetch news: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
};

const StockNews = () => {
  const { data: news, isLoading, error } = useQuery<NewsItem[]>({
    queryKey: ["stockNews"],
    queryFn: fetchNews,
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
    retry: 2, // Only retry twice
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  if (isLoading) {
    return <div className="text-neutral-400">Loading news...</div>;
  }

  if (error) {
    return (
      <div className="text-red-400">
        <p>Error loading news</p>
        <p className="text-xs mt-1">{error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }

  if (!news || news.length === 0) {
    return <div className="text-neutral-400">No news available</div>;
  }

  return (
    <div className="space-y-4">
      {news.slice(0, 5).map((item) => (
        <div
          key={item.id}
          className="p-3 rounded-md border border-neutral-700 hover:border-neutral-500 transition-colors"
        >
          <div className="flex items-start gap-3">
            {item.image && (
              <img
                src={item.image}
                alt={item.headline}
                className="w-16 h-16 object-cover rounded-md"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            <div className="flex-1">
              <h3 className="font-medium text-sm mb-1 line-clamp-2">
                {item.headline}
              </h3>
              <p className="text-xs text-neutral-400 line-clamp-2">
                {item.summary}
              </p>
              <div className="flex items-center gap-2 mt-2 text-xs text-neutral-500">
                <span>{item.source}</span>
                <span>•</span>
                <span>
                  {new Date(item.datetime * 1000).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StockNews; 
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
  const response = await fetch(
    `https://finnhub.io/api/v1/news?category=general&token=${import.meta.env.VITE_FINNHUB_API_KEY}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch news");
  }
  return response.json();
};

const StockNews = () => {
  const { data: news, isLoading, error } = useQuery<NewsItem[]>({
    queryKey: ["stockNews"],
    queryFn: fetchNews,
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });

  if (isLoading) {
    return <div className="text-neutral-400">Loading news...</div>;
  }

  if (error) {
    return <div className="text-red-400">Error loading news</div>;
  }

  return (
    <div className="space-y-4">
      {news?.slice(0, 5).map((item) => (
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
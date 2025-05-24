import { useQuery } from "@tanstack/react-query";

interface NewsResponse {
  headline: string;
  summary: string;
  timestamp: number;
}

const fetchNews = async (): Promise<NewsResponse> => {
  const response = await fetch("/api/news", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Please log in to view news");
    }
    throw new Error("Failed to fetch news");
  }

  return response.json();
};

const NewsDisplay = () => {
  const { data, isLoading, error } = useQuery<NewsResponse>({
    queryKey: ["news"],
    queryFn: fetchNews,
    refetchInterval: 1000 * 60 * 60 * 24, // Refetch once per day
    staleTime: 1000 * 60 * 60 * 24, // Consider data stale after 24 hours
    gcTime: 1000 * 60 * 60 * 24, // Keep in cache for 24 hours
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-4">
        <div className="h-4 w-3/4 bg-neutral-700/50 animate-pulse rounded" />
        <div className="h-3 w-full bg-neutral-700/50 animate-pulse rounded" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-neutral-400 text-sm">
        {error instanceof Error ? error.message : "Failed to load news. Please try again later."}
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 p-4">
      <h3 className="text-neutral-200 font-medium text-lg">{data.headline}</h3>
      <p className="text-neutral-400 text-sm leading-relaxed">{data.summary}</p>
    </div>
  );
};

export default NewsDisplay; 
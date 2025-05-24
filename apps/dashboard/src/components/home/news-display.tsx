import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { fetchNews } from "~/lib/client/news";

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  image: string;
  published: string;
  source: string;
}

interface NewsResponse {
  status: string;
  news: NewsArticle[];
}

const NewsDisplay = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["news"],
    queryFn: fetchNews,
    refetchInterval: 1000 * 60 * 60, // Refetch every hour
  });

  if (isLoading) {
    return (
      <div className="flex h-full">
        <div className="w-1/3 h-full bg-neutral-700/50 animate-pulse rounded-l-md" />
        <div className="flex-1 p-2 flex flex-col gap-1">
          <div className="h-4 w-3/4 bg-neutral-700/50 animate-pulse rounded" />
          <div className="h-3 w-full bg-neutral-700/50 animate-pulse rounded" />
          <div className="h-3 w-2/3 bg-neutral-700/50 animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-2 text-neutral-400 text-xs">
        {error instanceof Error ? error.message : "Failed to load news"}
      </div>
    );
  }

  if (!data?.news?.length) {
    return <div className="p-2 text-neutral-400 text-xs">No news available</div>;
  }

  const article = data.news[0];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-2">
        <Link
          to="/news/article/$articleId"
          params={{ articleId: "0" }}
          className="block h-full hover:bg-neutral-800/50 rounded-md transition-colors"
        >
          <div className="flex h-full">
            {article.image && (
              <div className="w-1/3 h-full">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover rounded-l-md"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
            <div className="flex-1 p-2 flex flex-col">
              <h3 className="text-sm font-medium line-clamp-1">{article.title}</h3>
              <p className="text-xs text-neutral-400 line-clamp-2 mt-1">{article.description}</p>
            </div>
          </div>
        </Link>
      </div>
      <div className="p-2 ">
        <Link
          to="/news"
          className="text-xs text-neutral-400 hover:text-neutral-200 transition-colors"
        >
          More News →
        </Link>
      </div>
    </div>
  );
};

export default NewsDisplay; 
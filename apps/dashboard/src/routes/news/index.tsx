import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { fetchNews } from "~/lib/client/news";
import { ScrollArea } from "~/components/ui/scroll-area";

const NewsPage = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["news"],
    queryFn: fetchNews,
    refetchInterval: 1000 * 60 * 60, // Refetch every hour
  });

  if (isLoading) {
    return (
      <ScrollArea className="h-full">
        <div className="p-4">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-48 bg-neutral-800/50 rounded-md" />
            ))}
          </div>
        </div>
      </ScrollArea>
    );
  }

  if (error) {
    return (
      <ScrollArea className="h-full">
        <div className="p-4 text-red-400">
          {error instanceof Error ? error.message : "Failed to load news"}
        </div>
      </ScrollArea>
    );
  }

  if (!data?.news?.length) {
    return (
      <ScrollArea className="h-full">
        <div className="p-4 text-neutral-400">No news available</div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        <h1 className="text-2xl font-semibold mb-6">Latest News</h1>
        <div className="space-y-6">
          {data.news.map((article, index) => (
            <Link
              key={article.id}
              to="/news/article/$articleId"
              params={{ articleId: index.toString() }}
              className="block bg-neutral-800/50 rounded-lg border border-neutral-600 hover:border-neutral-500 transition-colors overflow-hidden"
            >
              <div className="flex flex-col md:flex-row">
                {article.image && (
                  <div className="md:w-1/3 h-48 md:h-auto">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div className="flex-1 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 text-xs font-medium bg-neutral-700/50 rounded-full text-neutral-300">
                      {article.category}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium bg-neutral-700/50 rounded-full text-neutral-300">
                      {article.language}
                    </span>
                  </div>
                  <h2 className="text-xl font-medium mb-2 text-neutral-100">{article.title}</h2>
                  <p className="text-sm text-neutral-400 mb-4 line-clamp-2">{article.description}</p>
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <div className="flex items-center gap-2">
                      {article.author && (
                        <>
                          <span>{article.author}</span>
                          <span>•</span>
                        </>
                      )}
                      <span>{article.source}</span>
                    </div>
                    <time dateTime={article.published}>
                      {new Date(article.published).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </time>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
};

export const Route = createFileRoute('/news/')({
  component: NewsPage,
});

export default NewsPage;
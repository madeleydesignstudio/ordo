import { createFileRoute, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  published: string;
  source: string;
}

interface NewsResponse {
  status: string;
  news: NewsArticle[];
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

const ArticlePage = () => {
  const { articleId } = useParams({ from: '/news/article/$articleId' });
  const { data, isLoading, error } = useQuery<NewsResponse>({
    queryKey: ["news"],
    queryFn: fetchNews,
  });

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-neutral-800/50 rounded-md w-3/4" />
          <div className="h-4 bg-neutral-800/50 rounded-md w-1/2" />
          <div className="h-32 bg-neutral-800/50 rounded-md" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-400">
        {error instanceof Error ? error.message : "Failed to load article"}
      </div>
    );
  }

  const article = data?.news[parseInt(articleId)];
  if (!article) {
    return <div className="p-4 text-neutral-400">Article not found</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">{article.title}</h1>
      <div className="flex items-center gap-2 text-sm text-neutral-500 mb-6">
        <span>{article.source}</span>
        <span>•</span>
        <span>{new Date(article.published).toLocaleDateString()}</span>
      </div>
      <p className="text-neutral-300 mb-6">{article.description}</p>
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 hover:text-blue-300 transition-colors"
      >
        Read full article →
      </a>
    </div>
  );
};

export const Route = createFileRoute('/news/article/$articleId')({
  component: ArticlePage,
  loader: async ({ params }) => {
    const response = await fetchNews();
    const article = response.news[parseInt(params.articleId)];
    if (!article) {
      throw new Error('Article not found');
    }
    return {
      article,
    };
  },
});

export default ArticlePage;
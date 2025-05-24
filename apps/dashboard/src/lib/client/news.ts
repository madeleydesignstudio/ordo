interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  author: string;
  image: string;
  language: string;
  category: string;
  published: string;
  source: string;
}

interface NewsResponse {
  status: string;
  news: NewsArticle[];
}

export const fetchNews = async (): Promise<NewsResponse> => {
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
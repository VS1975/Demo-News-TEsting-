const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function getNews(limit = 10, page = 1) {
  const response = await fetch(`${API_URL}/api/news?limit=${limit}&page=${page}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Could not load news.");
  }

  return response.json();
}

export async function getArticle(slug: string) {
  const response = await fetch(
    `${API_URL}/api/news/${encodeURIComponent(slug)}`,
    { cache: "no-store" }
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Could not load article.");
  }

  return response.json();
}

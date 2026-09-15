import type { MetadataRoute } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const response = await fetch(`${API_URL}/api/news?limit=50&page=1`, {
    cache: "no-store",
  });

  if (!response.ok) {
    return [{ url: SITE_URL }];
  }

  const data = await response.json();

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
    },
    {
      url: `${SITE_URL}/news`,
      lastModified: new Date(),
    },
    ...data.articles.map((article: any) => ({
      url: `${SITE_URL}/news/${article.slug}`,
      lastModified: new Date(article.updated_at),
    })),
  ];
}

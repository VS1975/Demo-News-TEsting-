import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticle } from "../../../lib/api";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return {
      title: "Article Not Found",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: article.title,
    description: article.summary,
    alternates: {
      canonical: `${SITE_URL}/news/${article.slug}`,
    },
    openGraph: {
      type: "article",
      url: `${SITE_URL}/news/${article.slug}`,
      title: article.title,
      description: article.summary,
      publishedTime: article.published_at,
      authors: [article.author],
      images: article.image_url ? [article.image_url] : [],
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) notFound();

  const schema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.summary,
    image: article.image_url ? [article.image_url] : [],
    datePublished: article.published_at,
    dateModified: article.updated_at,
    author: {
      "@type": "Person",
      name: article.author,
    },
    publisher: {
      "@type": "Organization",
      name: article.source,
    },
    mainEntityOfPage: `${SITE_URL}/news/${article.slug}`,
  };

  return (
    <main className="container">
      <article className="article">
        <span className="badge">{article.category}</span>
        <h1>{article.title}</h1>

        <p className="meta">
          By {article.author} · {new Date(article.published_at).toLocaleString()}
        </p>

        {article.image_url && (
          <img
            className="article-image"
            src={article.image_url}
            alt={article.title}
          />
        )}

        <p>
          <strong>{article.summary}</strong>
        </p>

        <div className="content">{article.content}</div>

        <p className="meta">
          Source: {article.source}
        </p>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      </article>
    </main>
  );
}

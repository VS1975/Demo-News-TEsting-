import Link from "next/link";
import { getNews } from "../../lib/api";

export const metadata = {
  title: "Latest News",
  description: "Latest articles from Demo News.",
};

export default async function NewsListPage() {
  const data = await getNews(100, 1);

  return (
    <main className="container">
      <section className="hero">
        <h1>Latest News</h1>
        <p className="muted">Showing the first 100 articles from the dataset.</p>
      </section>

      <section className="grid">
        {data.articles.map((article: any) => (
          <article className="card" key={article.id}>
            <span className="badge">{article.category}</span>
            <h2>
              <Link href={`/news/${article.slug}`}>{article.title}</Link>
            </h2>
            <p>{article.summary}</p>
            <p className="meta">
              {new Date(article.published_at).toLocaleString()}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}

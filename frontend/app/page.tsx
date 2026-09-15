import Link from "next/link";
import { getNews } from "../lib/api";

export default async function HomePage() {
  const data = await getNews(100, 1);

  return (
    <main className="container">
      <section className="hero">
        <p className="badge">TRAINING DEMO</p>
        <h1>Latest News</h1>
        <p className="muted">
          One Next.js application can dynamically display thousands or millions
          of database-backed articles.
        </p>
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
              {article.author} · {new Date(article.published_at).toLocaleString()}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}

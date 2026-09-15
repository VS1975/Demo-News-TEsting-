const db = require("./db");

async function migrate() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS articles (
      id BIGSERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      summary TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT NOT NULL,
      author TEXT NOT NULL,
      source TEXT NOT NULL,
      image_url TEXT,
      published_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_articles_published_at
      ON articles (published_at DESC);

    CREATE INDEX IF NOT EXISTS idx_articles_category_published_at
      ON articles (category, published_at DESC);
  `);

  console.log("Database migration complete.");
  await db.end();
}

migrate().catch(async (err) => {
  console.error(err);
  await db.end();
  process.exit(1);
});

const slugify = require("slugify");
const db = require("./db");

const categories = [
  "Technology",
  "India",
  "Sports",
  "Business",
  "Science",
  "Entertainment",
  "Health",
  "Gujarat",
  "City",
  "Culture"
];

function buildArticleSet(count) {
  const articles = [];

  for (let i = 1; i <= count; i += 1) {
    const category = categories[(i - 1) % categories.length];
    const title = `${category} Update ${i}`;
    const slug = slugify(title, { lower: true, strict: true });
    const summary = `This is sample article ${i} for the ${category} section and is generated automatically for the demo dataset.`;
    const content = `This synthetic news article ${i} demonstrates how a large editorial dataset can be generated programmatically. It includes a title, category, summary, author, metadata, and published time for testing the news pipeline.\n\nThe system is designed to show how many records can be stored and served through the API without manually pasting each article.`;
    const author = "Demo News Desk";
    const source = "Demo News";
    const image_url = `https://placehold.co/1200x675?text=${encodeURIComponent(category)}+${i}`;
    const published_at = new Date(Date.now() - i * 60000).toISOString();

    articles.push({
      title,
      slug,
      summary,
      content,
      category,
      author,
      source,
      image_url,
      published_at
    });
  }

  return articles;
}

async function seed(targetCount = 10) {
  const articles = buildArticleSet(targetCount);

  for (const article of articles) {
    await db.query(
      `
      INSERT INTO articles
        (title, slug, summary, content, category, author, source, image_url, published_at)
      VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        summary = EXCLUDED.summary,
        content = EXCLUDED.content,
        category = EXCLUDED.category,
        author = EXCLUDED.author,
        source = EXCLUDED.source,
        image_url = EXCLUDED.image_url,
        published_at = EXCLUDED.published_at,
        updated_at = NOW()
      `,
      [
        article.title, article.slug, article.summary, article.content,
        article.category, article.author, article.source,
        article.image_url, article.published_at
      ]
    );
  }

  console.log(`Seeded ${articles.length} sample articles.`);
  await db.end();
}

const targetCount = Number(process.argv[2]) || 10;

seed(targetCount).catch(async (err) => {
  console.error(err);
  await db.end();
  process.exit(1);
});

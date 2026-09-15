const express = require("express");
const cors = require("cors");
const slugify = require("slugify");
const db = require("./db");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || "http://localhost:3000" }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", async (_req, res) => {
  try {
    await db.query("SELECT 1");
    res.json({ ok: true, database: "connected" });
  } catch {
    res.status(503).json({ ok: false, database: "unavailable" });
  }
});

app.get("/api/news", async (req, res) => {
  const requestedLimit = Number(req.query.limit || 10);
  const requestedPage = Number(req.query.page || 1);

  const limit = Math.min(Math.max(requestedLimit, 1), 200);
  const page = Math.max(requestedPage, 1);
  const offset = (page - 1) * limit;

  try {
    const result = await db.query(
      `
      SELECT id, title, slug, summary, category, author, source,
             image_url, published_at, updated_at
      FROM articles
      ORDER BY published_at DESC
      LIMIT $1 OFFSET $2
      `,
      [limit, offset]
    );

    res.json({
      page,
      limit,
      articles: result.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load news." });
  }
});

app.get("/api/news/:slug", async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM articles WHERE slug = $1 LIMIT 1`,
      [req.params.slug]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: "Article not found." });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load article." });
  }
});

app.post("/api/news", async (req, res) => {
  const {
    title,
    summary,
    content,
    category,
    author,
    source = "Demo News",
    image_url = null,
    published_at = new Date().toISOString()
  } = req.body;

  if (!title || !summary || !content || !category || !author) {
    return res.status(400).json({
      error: "title, summary, content, category and author are required."
    });
  }

  const slug = slugify(title, { lower: true, strict: true });

  try {
    const result = await db.query(
      `
      INSERT INTO articles
        (title, slug, summary, content, category, author, source, image_url, published_at)
      VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
      `,
      [title, slug, summary, content, category, author, source, image_url, published_at]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({
        error: "An article with this slug already exists."
      });
    }

    console.error(err);
    res.status(500).json({ error: "Failed to create article." });
  }
});

app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});

const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
require("dotenv").config();

const DATA_DIR = path.join(__dirname, "..", "data");
const DATA_FILE = path.join(DATA_DIR, "articles.json");

function ensureDemoDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
    return [];
  }

  try {
    const content = fs.readFileSync(DATA_FILE, "utf8");
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    const backupFile = `${DATA_FILE}.corrupt-${Date.now()}.bak`;
    fs.copyFileSync(DATA_FILE, backupFile);
    const recovered = [];
    fs.writeFileSync(DATA_FILE, JSON.stringify(recovered, null, 2));
    console.warn(`Demo data file was corrupted; reset to an empty dataset and backed up the original at ${backupFile}`);
    return recovered;
  }
}

function saveDemoData(articles) {
  const tempFile = `${DATA_FILE}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(articles, null, 2), "utf8");
  fs.renameSync(tempFile, DATA_FILE);
}

function buildArticle(row) {
  return {
    ...row,
    id: Number(row.id),
    published_at: row.published_at || new Date().toISOString(),
    updated_at: row.updated_at || row.published_at || new Date().toISOString(),
    created_at: row.created_at || row.published_at || new Date().toISOString(),
  };
}

function parseInsertRow(sql, params) {
  const match = sql.match(/INSERT INTO articles\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i);
  if (!match) return null;

  const columns = match[1].split(",").map((col) => col.trim());
  const row = {};
  columns.forEach((column, index) => {
    row[column] = params[index];
  });
  return row;
}

const demoDb = {
  async query(sql, params = []) {
    const normalized = (sql || "").replace(/\s+/g, " ").trim();

    if (/^SELECT 1\b/i.test(normalized)) {
      return { rows: [{ "?column?": 1 }] };
    }

    if (/^CREATE TABLE IF NOT EXISTS articles/i.test(normalized)) {
      ensureDemoDataFile();
      return { rows: [] };
    }

    if (/^CREATE INDEX IF NOT EXISTS /i.test(normalized)) {
      return { rows: [] };
    }

    if (/^SELECT id, title, slug, summary, category, author, source, image_url, published_at, updated_at FROM articles ORDER BY published_at DESC LIMIT \$1 OFFSET \$2$/i.test(normalized)) {
      const articles = ensureDemoDataFile();
      const limit = Number(params[0] || 10);
      const offset = Number(params[1] || 0);
      return {
        rows: articles.slice(offset, offset + limit).map((article) => buildArticle(article)),
      };
    }

    if (/^SELECT \* FROM articles WHERE slug = \$1 LIMIT 1$/i.test(normalized)) {
      const articles = ensureDemoDataFile();
      const slug = params[0];
      const article = articles.find((item) => item.slug === slug);
      return { rows: article ? [buildArticle(article)] : [] };
    }

    if (/^INSERT INTO articles\s*\(/i.test(normalized) && /RETURNING \*$/i.test(normalized)) {
      const articles = ensureDemoDataFile();
      const row = parseInsertRow(sql, params);
      if (!row) throw new Error("Unsupported INSERT format in demo mode.");

      const nextId = articles.reduce((max, article) => Math.max(max, Number(article.id || 0)), 0) + 1;
      const now = new Date().toISOString();
      const candidate = {
        id: nextId,
        title: row.title,
        slug: row.slug,
        summary: row.summary,
        content: row.content,
        category: row.category,
        author: row.author,
        source: row.source,
        image_url: row.image_url || null,
        published_at: row.published_at || now,
        updated_at: now,
        created_at: now,
      };

      const index = articles.findIndex((item) => item.slug === candidate.slug);
      if (index >= 0) {
        articles[index] = { ...articles[index], ...candidate, id: articles[index].id };
      } else {
        articles.push(candidate);
      }

      saveDemoData(articles);
      return { rows: [buildArticle(candidate)] };
    }

    if (/^INSERT INTO articles\s*\(/i.test(normalized) && /ON CONFLICT \(slug\) DO UPDATE SET/i.test(normalized)) {
      const articles = ensureDemoDataFile();
      const slug = params[1];
      const index = articles.findIndex((item) => item.slug === slug);
      const now = new Date().toISOString();
      const update = {
        title: params[0],
        slug: params[1],
        summary: params[2],
        content: params[3],
        category: params[4],
        author: params[5],
        source: params[6],
        image_url: params[7],
        published_at: params[8],
        updated_at: now,
        created_at: index >= 0 ? articles[index].created_at || now : now,
      };

      if (index >= 0) {
        articles[index] = { ...articles[index], ...update, id: articles[index].id };
      } else {
        const nextId = articles.reduce((max, item) => Math.max(max, Number(item.id || 0)), 0) + 1;
        articles.push({ id: nextId, ...update });
      }

      saveDemoData(articles);
      return { rows: [] };
    }

    throw new Error(`Unsupported SQL in demo mode: ${sql}`);
  },
  async end() {
    return true;
  },
};

const primaryPool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/news_demo",
  connectionTimeoutMillis: 1200,
  idleTimeoutMillis: 30000,
  max: 2,
});

const db = {
  async query(sql, params) {
    try {
      return await primaryPool.query(sql, params);
    } catch (err) {
      if (!db._fallback) {
        console.warn("PostgreSQL unavailable. Falling back to local demo data store.");
        db._fallback = demoDb;
      }
      return db._fallback.query(sql, params);
    }
  },
  async end() {
    if (db._fallback && typeof db._fallback.end === "function") {
      await db._fallback.end();
    }
    if (primaryPool && typeof primaryPool.end === "function") {
      await primaryPool.end();
    }
  },
};

module.exports = db;

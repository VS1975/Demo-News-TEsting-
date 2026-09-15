# News Pipeline Demo — React/Next.js + Node.js + PostgreSQL

This project is a working news demo that shows how articles move through a simple pipeline:

News data → Node.js API → PostgreSQL → Next.js frontend → article pages and sitemap

It includes seed scripts for sample content and a local fallback data layer for demo environments where PostgreSQL is not available.

## Requirements

- Node.js 20+
- npm
- PostgreSQL 15+ or Docker Desktop

## Project structure

- backend/
  - Express API
  - database connection logic
  - migration and seed scripts
- frontend/
  - Next.js app with dynamic article pages
- docker-compose.yml
  - PostgreSQL service for the demo database

## 1. Start PostgreSQL

This project expects a database named `news_demo` on `localhost:5432`.

If Docker is installed, start the database from the project root:

```powershell
cd "E:\downloads\news-pipeline-demo\news-pipeline-demo"
docker compose up -d
```

Then verify it is running:

```powershell
docker ps
```

You should see a Postgres container listening on port 5432.

## 2. Install backend dependencies

```powershell
cd "E:\downloads\news-pipeline-demo\news-pipeline-demo\backend"
npm install
```

## 3. Run the database migration

```powershell
npm run migrate
```

This creates the `articles` table.

## 4. Seed sample data

The app can be seeded with a small or large dataset.

Small demo set:

```powershell
npm run seed
```

Larger demo set (example: 50 articles):

```powershell
node src/seed.js 50
```

Very large dataset (example: 100,000 articles):

```powershell
node src/seed.js 100000
```

## 5. Start the backend

Open a terminal and run:

```powershell
cd "E:\downloads\news-pipeline-demo\news-pipeline-demo\backend"
node src/server.js
```

The API will run at:

```text
http://localhost:4000
```

Useful endpoints:

- GET /api/health
- GET /api/news?limit=100&page=1
- GET /api/news/:slug
- POST /api/news

## 6. Start the frontend

Open a second terminal and run:

```powershell
cd "E:\downloads\news-pipeline-demo\news-pipeline-demo\frontend"
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

Test these routes:

- /
- /news
- /news/technology-update-1
- /sitemap.xml

## 7. How to add more news

You can add a new article through the API with a POST request.

Example in PowerShell:

```powershell
$body = @{
  title = "New Demo Article"
  summary = "This is a sample article added through the API."
  content = "This is the full article body."
  category = "Technology"
  author = "Demo News Desk"
  source = "Demo News"
  image_url = "https://placehold.co/1200x675?text=New+Article"
  published_at = "2026-09-15T10:00:00Z"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4000/api/news" -Method Post -ContentType "application/json" -Body $body
```

You can also generate a larger seed set with:

```powershell
node src/seed.js 50
```

## 8. How to know data is loading

The fastest checks are:

1. Backend response:

```powershell
Invoke-WebRequest -Uri "http://localhost:4000/api/news?limit=100&page=1" -UseBasicParsing
```

2. Frontend page loads:

- http://localhost:3000/
- http://localhost:3000/news

If the response contains `articles: [...]`, the app is successfully loading data.

## 9. Why PostgreSQL warnings happen

The app tries to connect to PostgreSQL first. If that database is not running, it logs a warning and uses a local demo fallback store.

This fallback is useful for testing and demos, but the full app is intended to run with PostgreSQL.

For the official demo flow, always start PostgreSQL first and then run the migration/seed scripts.

## 10. What this demo teaches

1. One dynamic route can serve many article pages.
2. The backend validates and saves article data.
3. PostgreSQL stores article records securely.
4. SEO metadata is generated dynamically for each page.
5. A sitemap can be generated from database content.
6. Pagination helps the frontend render large datasets without overloading the browser.

## 11. Important notes

This is a training sample, not a production deployment.

For a real production system, you would also want:

- authentication and role-based access
- validation and sanitization
- rate limiting
- image storage and CDN
- indexing and query monitoring
- backups and migrations
- caching and deployment automation

The sample content is intentionally fictional and owned for demo purposes.

# News Pipeline Demo

This project is a small demo app that shows how a news system can work end-to-end:

News content -> Node.js API -> PostgreSQL -> Next.js frontend -> dynamic article pages -> sitemap

The app includes:
- a backend API
- PostgreSQL database support
- migration and seed scripts
- a Next.js frontend
- sample news articles
- SEO metadata for each article
- a sitemap route

It is designed to be easy to run locally and easy to test by other developers without any manual setup from the original creator.

## Tech stack

- Frontend: Next.js + React
- Backend: Node.js + Express
- Database: PostgreSQL
- Local demo fallback: JSON-backed store if PostgreSQL is unavailable

## Prerequisites

Before running the project, install:

- Node.js 20+
- npm
- Docker Desktop (recommended for PostgreSQL)

## Project structure

```text
news-pipeline-demo/
├── backend/
│   ├── src/
│   ├── data/
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
├── frontend/
│   ├── app/
│   ├── lib/
│   ├── .env.local.example
│   ├── package.json
│   └── package-lock.json
├── docker-compose.yml
├── README.md
└── .gitignore
```

## 1. Clone the repo

```bash
git clone https://github.com/VS1975/Demo-News-TEsting-.git
cd Demo-News-TEsting-
```

## 2. Start PostgreSQL

This project expects PostgreSQL on localhost:5432 with a database named `news_demo`.

The easiest way is to use Docker:

```powershell
cd "E:\path\to\Demo-News-TEsting-"
docker compose up -d
```

From the repo root, it will start a `postgres` container using the values from `docker-compose.yml`.

To confirm it is running:

```powershell
docker ps
```

You should see the PostgreSQL container running on port 5432.

## 3. Backend setup

Open a terminal in the backend folder:

```powershell
cd "E:\path\to\Demo-News-TEsting-\backend"
npm install
```

Create the environment file from the example:

```powershell
copy .env.example .env
```

The file should look like this:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/news_demo
PORT=4000
FRONTEND_ORIGIN=http://localhost:3000
```

Run the migration:

```powershell
npm run migrate
```

This creates the `articles` table in PostgreSQL.

Seed the database with sample content:

```powershell
npm run seed
```

To generate a larger set, for example 100 articles:

```powershell
node src/seed.js 100
```

To generate a very large dataset, for example 100,000 articles:

```powershell
node src/seed.js 100000
```

Start the backend API:

```powershell
node src/server.js
```

The backend should be available at:

```text
http://localhost:4000
```

## 4. Frontend setup

Open a second terminal in the frontend folder:

```powershell
cd "E:\path\to\Demo-News-TEsting-\frontend"
npm install
```

Create the environment file from the example:

```powershell
copy .env.local.example .env.local
```

The file should look like this:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Start the frontend:

```powershell
npm run dev
```

Open the app in the browser:

```text
http://localhost:3000
```

## 5. Test the app

### Health check

```powershell
Invoke-WebRequest -Uri http://localhost:4000/api/health -UseBasicParsing
```

Expected result:

```json
{"ok":true,"database":"connected"}
```

### List articles

```powershell
Invoke-WebRequest -Uri "http://localhost:4000/api/news?limit=100&page=1" -UseBasicParsing
```

This should return JSON with article rows.

### Open pages in browser

Check these routes:

- http://localhost:3000/
- http://localhost:3000/news
- http://localhost:3000/news/technology-update-1
- http://localhost:3000/sitemap.xml

## 6. Add more news

You can add a new article through the API by sending a POST request.

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

After that, refresh the frontend pages and the new article should appear.

## 7. How to know data is loading

You can confirm that data is flowing in any of these ways:

1. Backend check

```powershell
Invoke-WebRequest -Uri "http://localhost:4000/api/news?limit=100&page=1" -UseBasicParsing
```

2. Browser check

- open http://localhost:3000/
- open http://localhost:3000/news
- articles should render as cards with titles and summaries

3. Terminal logs

The backend logs startup information and errors when the API fails.

## 8. Why you may see PostgreSQL unavailable

The app tries to connect to PostgreSQL first. If PostgreSQL is not running or the connection string is wrong, it prints a warning and falls back to a local demo store.

For the full experience, always:

- start Docker
- run `docker compose up -d`
- ensure the database is available on localhost:5432
- run the migration and seed commands

## 9. What the app demonstrates

This project shows how to:

- store article data in a relational database
- query articles through a REST API
- render them in a Next.js frontend
- generate article metadata dynamically
- create a sitemap from database content
- paginate large datasets without loading everything at once

## 10. Notes for the team

This is a training/demo project, not a production deployment.

For production, you would also want:

- authentication and authorization
- rate limiting
- validation and sanitization
- image storage/CDN
- database backups
- monitoring and logging
- caching and deployment automation

The sample article content is fictional and intended only for demo purposes.

## 11. Quick start summary

If you want the shortest possible setup order, run:

```powershell
cd "E:\path\to\Demo-News-TEsting-"
docker compose up -d
cd backend
npm install
copy .env.example .env
npm run migrate
npm run seed
node src/server.js
```

Then in another terminal:

```powershell
cd "E:\path\to\Demo-News-TEsting-\frontend"
npm install
copy .env.local.example .env.local
npm run dev
```

Then open:

```text
http://localhost:3000
```

This is enough to run and test the demo without any additional help.

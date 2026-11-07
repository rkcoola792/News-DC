# NewsDC

Data center content discovery, built with React/Vite, JavaScript/JSX, Tailwind, Lucide, React Router, Express, PostgreSQL and Prisma. Gemini-first/OpenAI-fallback routing, automatic persisted enrichment, cited assistant answers and source-linked trend reports are available locally.

## Run with Docker

Prerequisites: a running Docker Desktop Linux engine and Node.js 22.12+ for local helper commands.

```sh
npm install
npm run setup:local
docker compose up --build -d
```

Open [NewsDC](http://127.0.0.1:5000/). The app serves both the SPA and `/api/v1` on port 5000. PostgreSQL persists in a named volume and is exposed only on `127.0.0.1:55434` by default. Configure `POSTGRES_PORT` if that port is unavailable. Compose runs migrations before API startup.

`setup:local` creates root `.env` with random local database/operator credentials and never overwrites an existing file. View `ADMIN_API_KEY` in that file to unlock Dashboard; do not share it or put it in a `VITE_` variable. Existing `.env` users can follow `.env.example`. Use URL-safe credentials in Compose's database URL. `.env` is gitignored and excluded from the image.

The latest verified workspace collection contains **702 real source records**, including 600 research papers and two discovered videos. AI features require server-side provider keys; browsing and ingestion work without them. Indexed counts do not establish AI-confirmed relevance. See [the handoff](docs/NON_AI_HANDOFF.md) and [feature tracker](docs/IMPLEMENTATION_STATUS.md).

## Ingest real content

Gemini-first provider routing is implemented. Root .env uses GEMINI_API_KEY, OPENAI_API_KEY and AI_PROVIDER_ENABLED=true (fresh example defaults false). Dashboard operator controls can check the connection: Gemini gets two temporary-failure retries before one OpenAI fallback. No application spending or fixed daily request cap is configured, as requested; provider quotas and retry/timeout guards remain. Automatic and operator enrichment, cited assistant and cached trend reports are implemented. Enable AI_AUTO_ENRICHMENT=true for background processing; use Dashboard to pause/resume it. See [content enrichment](docs/CONTENT_ENRICHMENT.md). See [provider routing](docs/AI_PROVIDER_ROUTING.md).

Approved sources: Hacker News via Algolia's public API, Data Center Knowledge RSS and arXiv research metadata, plus public YouTube oEmbed metadata for video links discovered through Hacker News. In Dashboard, enter the operator key and select **Run ingestion**. It returns persisted run IDs; status/counts appear in recent runs. Enable/disable each source there.

Alternatively, from the host:

```sh
npm run ingest
```

The CLI reads root `.env` and uses PostgreSQL on host port 55434. Scheduled refresh is opt-in: set `INGESTION_ENABLED=true` and recreate the app container. Default interval is 1800000 ms (30 minutes), minimum 60000 ms.

The original live run inserted 50 articles and 41 discussions. The arXiv adapter added 50 research records; repeat research ingestion inserted zero duplicates. It fetches the newest 50 title-matched data center papers per run, retains source abstracts/authors/tags/available DOI and links to arXiv abstract pages. No PDFs or AI summaries are generated. Run one ingestion process to respect the shared arXiv request limit. See [research ingestion](docs/RESEARCH_INGESTION.md) for query, terms and limitations. Optional fields stay absent when sources omit them. Images that fail to load are hidden. Video metadata still requires protected Dashboard import; no live video adapter is configured.

## Local development

```sh
npm run db:up
npm run db:migrate
npm run dev:api
# Another terminal:
npm run dev
```

If the Docker app is running on port 5000, stop just that service with `docker compose stop app` before starting the host API. Vite proxies `/api` to `127.0.0.1:5000`. Set browser-safe `VITE_API_BASE_URL` in `apps/web/.env.local` only when using another API origin.

## Prisma and database workflow

Application queries use Prisma Client in `packages/db`, with PostgreSQL's driver adapter. Normal `npm install` generates the client through root postinstall; after installing with `--ignore-scripts`, run:

```sh
npm run db:generate
```

Existing versioned SQL migrations remain the schema authority because they preserve database checks, triggers, partial indexes and the generated full-text vector. To evolve the database: add a new migration, run `npm run db:migrate`, then `npm run db:introspect` and `npm run db:generate`. Preserve the Prisma `fullTextSearchPostgres` preview feature when introspecting. Do not use `db push` or reset an existing database. Application code uses `findMany`, `findUnique`, `create`, `update`, transactions and aggregates rather than handwritten SQL.

## Verification and formatting

```sh
node --test apps/web/src/utils/*.test.js
npm run test:db
npm run test:api
npm run format:check
npm run smoke
```

Database integration tests require `TEST_DATABASE_URL` in the process environment pointing to a dedicated disposable PostgreSQL database. Without it, real DB tests explicitly skip. They create/drop generated test schemas; the readiness test applies migrations to that test database's public schema. Never use production or the user's development database for these tests.

Latest API results: **61 passing results**, real PostgreSQL enabled, no skips. Same-day DB/frontend suites previously passed 7/23 results. Docker build/start/health, local SPA/API smoke and selected browser checks passed. Full accessibility/browser coverage and public production deployment are not claimed.

For the slower, real one-minute scheduler and database outage/recovery checks, run `npm run test:reliability` with Docker available and loopback port 55435 free. It creates its own uniquely named disposable PostgreSQL container, stops/restarts only that database, verifies safe unavailable/recovery behavior, then removes its container/volumes. It does not read root `.env` or modify the development database. Leave the app scheduler off unless periodic ingestion is wanted.

`npm run format` runs Prettier and Prisma schema formatting. `npm run format:check` runs Prettier checks and Prisma schema validation. Generated files, dependencies, builds and secrets are excluded.

## Project layout

```text
apps/web/src/pages/        Separate screen components
apps/web/src/components/  Shared layout, feed, forms and states
apps/web/src/hooks/        Preferences, history and API resources
services/api/src/         Express, content services, ingestion and protected operations
packages/db/              Prisma schema/client factory, repositories and migration runner
packages/shared/          Controlled taxonomy shared with frontend/backend
database/migrations/     Versioned PostgreSQL schema/taxonomy/index migrations
scripts/                  Safe local configuration and smoke helpers
docs/                     Requirements, contracts, progress and handoff
```

## Scope and limits

Bookmarks/preferences/history stay in the browser, with no registration. Publisher descriptions are not labelled AI summaries. Metadata keyword rules supply topic labels; ranking uses preferences, history, freshness and actual available engagement. No AI summaries, insights, scores, assistant responses or transcript claims are generated.

Search uses Prisma's PostgreSQL full-text feature; source filters, pagination and original attribution are connected to the database. Exports are capped at 100 matching records. ForYou/Trending rank matching records in-process for the MVP. The actual dataset is 141 metadata-filtered records, below the 500-relevant-record target and not AI-verified. Hosting, broader sources/backfill and the AI phase remain future work after user testing. Gemini-first provider routing with OpenAI fallback is implemented; the user removed application spending/daily caps. Enrichment and cited assistant are next. See docs/AI_DEMO_PLAN.md and docs/AI_PROVIDER_ROUTING.md.

Read [PRD](docs/PRD.md), [feature catalogue](docs/FEATURES.md), [implementation sequence](docs/REQUIREMENTS_SEQUENCE.md), and [current status](docs/IMPLEMENTATION_STATUS.md).

## Local startup troubleshooting

Use `http://127.0.0.1:5000/` for the complete Docker-served app, or `http://127.0.0.1:5173/` for Vite while the Docker API is running on port 5000. `npm run dev` starts only the frontend. Vite now uses a strict 5173 port so an existing stale listener produces a clear error instead of silently switching ports. Stop only confirmed project Vite processes before restarting; do not stop the API/database to fix a stale frontend.

## Assignment completion planning

The [strict PRD/MVP audit and completion plan](docs/ASSIGNMENT_COMPLETION_PLAN.md) distinguishes working non-AI behavior from remaining requirements. Next proposed feature: F2 source/import tag extraction and persistence, followed by acceptance checks. AI remains deferred until explicitly approved.

## Source tags

F2 tags are implemented from RSS/Atom or optional operator-import `tags` arrays through Prisma persistence, list/detail/JSON export and detail display. See [F2 tag rules](docs/F2_TAGS.md). Omitted tags preserve existing mappings; `[]` clears them. Enrichment is operator controlled; source tags stay separate from AI topics.

## Current feature-complete handoff

See [assistant and automation contracts](docs/ASSISTANT_AUTOMATION.md) and [whole-application test plan](docs/TESTING_AND_ACCEPTANCE.md). Remaining release work: finish/review dataset classification toward 500 relevant records, perform user acceptance, choose hosting and deploy. P2 features stay deferred. Local data and secrets persist; do not delete the PostgreSQL volume.

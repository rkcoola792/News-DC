# NewsDC implementation tracker

Updated: 5 November 2026 (Asia/Calcutta). Scope: the user requested a complete **non-AI build first**, using the PRD stack with Prisma for application queries.

## Current handoff

- Running locally at **http://127.0.0.1:5000/** in Docker with persistent PostgreSQL on host port **55434**.
- **91 actual source records:** 50 articles from Data Center Knowledge RSS and 41 discussions from the Hacker News/Algolia adapter. No fixtures were inserted into the development collection. Video/research imports are supported but their current live counts are zero.
- Both source fetches succeeded. A second run fetched 50 records per source and inserted **zero duplicates**. These are metadata-rule-filtered records, not AI-verified relevant records. The 500-relevant-record product target is not achieved yet.
- Current automated results: **52 passing test results** (23 frontend logic, 7 DB foundation including nested integration results, 22 API/ingestion including nested results). No skips in the database-enabled runs.
- Docker image builds successfully; app/database are healthy; SPA deep links, readiness, content/search/topics and protected metrics passed `npm run smoke`.
- Browser smoke checks verified live content/search/detail, Saved after reload, reading history after reload, Preferences Save/Cancel/Reset/reload, operator dashboard, theme reload and 320px layout. Primary/secondary contrast ratios: light 17.74/4.97, dark 15.69/7.40. This is not a complete accessibility audit or exhaustive browser matrix.

## Status meanings

“Implemented” identifies delivered behavior within the named scope. “Tested” means the relevant automated checks passed; “browser checked” is a limited manual smoke check, not exhaustive acceptance. “Non-AI” means unavailable AI-derived signals/output are intentionally excluded. “Metadata import” means the format is supported without claiming a configured live source for it. Deferred AI/P2 work remains in the final-product catalogue.

## Feature inventory

| ID  | Feature                     | Priority    | Status                             | Evidence / limitations                                                                                                                  |
| --- | --------------------------- | ----------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| F1  | Source ingestion            | P0          | Implemented; live verified         | Both approved adapters fetched 50 items; 91 unique records persisted.                                                                   |
| F2  | Metadata extraction         | P0          | Implemented; tested                | Source metadata normalization, publisher attribution, dates and optional fields; Prisma persistence.                                    |
| F3  | Duplicate detection         | P0          | Implemented; tested                | Canonical URL and title/domain fingerprint deduplication; unique indexes; repeat ingestion inserts zero duplicates.                     |
| F4  | Scheduled refresh           | P0          | Implemented; opt-in                | Configurable interval scheduler, shared single-process job lock, persistent run IDs/status. Timer invocation tested; default off.       |
| F5  | Content validation          | P0          | Implemented; tested                | Zod validation, safe failure reasons/counts, HTTP(S) URLs, dates/formats and optional-field checks.                                     |
| F6  | Source management           | P1          | Implemented; tested                | Protected source list, latest run, enable/disable; registry endpoints restricted to approved public sources.                            |
| F7  | Relevance detection         | P0          | Deferred AI phase                  | Explicitly deferred by the user. Keyword topic rules and publisher descriptions are not AI output.                                      |
| F8  | Categorization              | P0          | Deferred AI phase                  | Explicitly deferred by the user. Keyword topic rules and publisher descriptions are not AI output.                                      |
| F9  | Summarization               | P0          | Deferred AI phase                  | Explicitly deferred by the user. Keyword topic rules and publisher descriptions are not AI output.                                      |
| F10 | Insight extraction          | P0          | Deferred AI phase                  | Explicitly deferred by the user. Keyword topic rules and publisher descriptions are not AI output.                                      |
| F11 | Quality scoring             | P0          | Deferred AI phase                  | Explicitly deferred by the user. Keyword topic rules and publisher descriptions are not AI output.                                      |
| F12 | Content classification      | P0          | Deferred AI phase                  | Explicitly deferred by the user. Keyword topic rules and publisher descriptions are not AI output.                                      |
| F13 | Trend detection             | P1          | Deferred AI phase                  | Explicitly deferred by the user. Keyword topic rules and publisher descriptions are not AI output.                                      |
| F14 | ForYou                      | P0          | Implemented; non-AI                | Server-side preferences/history/freshness/available-engagement ranking. AI relevance/quality signals omitted.                           |
| F15 | Trending                    | P0          | Implemented; non-AI                | Heuristic freshness/engagement order and timeframe filters; no fabricated engagement.                                                   |
| F16 | Topic feed                  | P0          | Implemented; tested                | API topic feeds and shared-category filtering.                                                                                          |
| F17 | Related content             | P1          | Implemented; tested                | Related records share configured topic labels; advanced similarity remains future scope.                                                |
| F18 | Reading history             | P0          | Implemented; smoke checked         | 200 unique local openings, revisit/clear utilities; successful live detail visit and browser reload verified.                           |
| F19 | Preferences                 | P0          | Implemented; browser checked       | 14 topics/four formats, draft Save/Cancel/Reset and actual browser reload verified.                                                     |
| F20 | Home / ForYou               | P0          | Implemented; connected             | API-backed ForYou feed, pagination, preference entry and recoverable loading/error/empty states.                                        |
| F21 | Trending                    | P0          | Implemented; connected             | Trending endpoint powers ranked UI with timeframe controls.                                                                             |
| F22 | Topics                      | P0          | Implemented; connected             | 14-topic directory with database-derived counts and filtered links.                                                                     |
| F23 | Content detail              | P0          | Implemented; non-AI                | Real metadata, publisher/date/author/source, related links, video/duration/DOI when available; AI panels explicitly disabled.           |
| F24 | Search                      | P0          | Implemented; tested                | PostgreSQL full-text search via Prisma, combined filters and URL query persistence.                                                     |
| F25 | Bookmarks                   | P0          | Implemented; browser checked       | Local bookmarks, invalid-storage recovery, failed-write feedback; live save and browser reload verified.                                |
| F26 | Dashboard                   | P1          | Implemented; browser checked       | Protected metrics/type/processing counts, 7-day ingestion chart, source controls, recent runs and metadata imports.                     |
| F27 | Filters and sorting         | P0          | Implemented; tested                | Type/topic/publisher/date/score filters and sorting. AI-score filters may return empty results while scores are null.                   |
| F28 | Theme                       | P1          | Implemented; smoke checked         | Light/dark preference reload tested; primary/secondary text contrast checked. Full accessibility audit remains pending.                 |
| F29 | Pagination/infinite loading | P0          | Implemented; tested                | URL page navigation, bounded API pagination, stable tie-breakers; no duplicate records across tested pages.                             |
| F30 | Keyboard shortcuts          | P2          | Deferred P2                        | Keyboard shortcuts remain future scope; ordinary keyboard controls and visible focus are implemented.                                   |
| F31 | AI research assistant       | P0          | Deferred AI phase                  | Explicitly deferred by the user. Keyword topic rules and publisher descriptions are not AI output.                                      |
| F32 | Source references           | P0          | Deferred AI phase                  | Explicitly deferred by the user. Keyword topic rules and publisher descriptions are not AI output.                                      |
| F33 | JSON export                 | P1          | Implemented; tested                | Filtered downloadable JSON, max 100 matching records per export.                                                                        |
| F34 | Markdown export             | P1          | Implemented; tested                | Markdown with publisher attribution and original links, max 100 records.                                                                |
| F35 | Docker deployment           | P0          | Implemented; local Docker verified | App and PostgreSQL build/start/health smoke-tested. Public hosting and production release checks remain pending.                        |
| F36 | Logging/error handling      | P0          | Implemented; non-AI                | Request IDs, safe JSON errors, structured logs, upstream limits/retry, persistent ingestion failure counts; AI failures deferred.       |
| F37 | Documentation               | P0          | Maintained                         | README, runtime contracts, handoff, verification and feature tracker updated. Public deployment not claimed.                            |
| F38 | AI-assisted development log | P0          | Maintained                         | Actual changes, test results, browser checks and recovery steps logged; historical snapshots archived.                                  |
| F39 | Multi-format content model  | P0          | Verified foundation                | Prisma Client over PostgreSQL; all four formats and optional fields round-trip. Versioned SQL migrations preserve DB-specific features. |
| F40 | Content-type filter         | P0          | Implemented; tested                | Four-format filters run against stored metadata.                                                                                        |
| F41 | Video discovery             | P1          | Implemented; metadata import       | Operator imports can store/recommend video metadata. No dedicated live video source configured.                                         |
| F42 | Video detail                | P1          | Implemented; metadata only         | Video detail displays available duration/thumbnail and safe original playback link; no embedded hosting/transcripts.                    |
| F43 | Video metadata extraction   | P1          | Implemented; metadata only         | Validated video metadata imports; no invented transcripts/content claims.                                                               |
| F44 | Research discovery          | P1          | Implemented; metadata import       | Research metadata/DOI can be imported, searched and displayed. No dedicated live research source configured.                            |
| F45 | Unified search              | P0          | Implemented; tested                | One Prisma/PostgreSQL search across all stored formats with type/publisher/original URL.                                                |
| F46 | Operational observability   | Recommended | Implemented; non-AI                | Persistent ingestion lifecycle/counts/errors and protected manual runs. AI processing logs remain schema-only until AI phase.           |

## What to do next

1. User acceptance testing: follow [NON_AI_HANDOFF.md](NON_AI_HANDOFF.md) and report UI/data issues. The app and database are left running.
2. Resolve acceptance findings, then expand source coverage/backfill toward the 500-record target if required. Dedicated video/research sources need a separate source decision; operator metadata import already supports those formats.
3. When explicitly approved, choose the LLM provider/model/budget and implement the deferred AI enrichment, scoring and grounded assistant/citation phase. No LLM key is needed now.
4. Choose hosting for public deployment later. Local Docker delivery is verified; public deployment is not done.

## Architecture and operational decisions

- React/Vite JavaScript, Tailwind, Lucide, React Router; modular Express backend; PostgreSQL with Prisma 7 Client and `@prisma/adapter-pg`.
- Application content, taxonomy, operation and health queries use Prisma. Raw SQL remains only in versioned schema migrations and PostgreSQL-specific integration-test infrastructure.
- Shared framework-independent taxonomy is in `packages/shared`. All pages/components remain separate. Prettier formats JS/JSX/CSS/docs; Prisma formats and validates its schema.
- Existing migrations are retained to preserve checks, partial indexes, triggers and generated tsvector. Prisma Client full-text search is used for the application; this does not claim it uses the existing generated-vector GIN index. Profile and optimize that path if dataset growth warrants it.
- Scheduler is opt-in (`INGESTION_ENABLED=true`, minimum interval 60000 ms, default 30 minutes); one app process handles ingestion with bounded source requests and a shared lock. Job state is persisted; interrupted pending/running jobs are marked failed at restart.
- Dashboard requires a server-checked operator key held only in UI memory. Local `.env` contains generated development secrets and is gitignored/excluded from Docker builds. No public ingestion/write endpoint or end-user registration was added.
- Exports are capped at 100 matching records; live source adapters bound item count/response size. Recommendations rank the matching stored dataset in process for this MVP; large-scale ranking is not claimed.

## Change and verification log

| Date       | Increment                 | Actual result                                                                                                                                                                                                                                                                                                                                                  |
| ---------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-11-05 | UI/local state foundation | Separate pages/routes/shared components, bookmarks/history/preferences/theme, formatting and preview-ranking increments completed. Earlier snapshots preserved in IMPLEMENTATION_HISTORY.md.                                                                                                                                                                   |
| 2026-11-05 | F39 initial DB foundation | Real PostgreSQL migration/persistence/constraint tests passed before ORM change.                                                                                                                                                                                                                                                                               |
| 2026-11-05 | Prisma migration          | Introspected existing tables; generated Prisma 7 Client; content CRUD/readiness and new backend modules use Prisma. Original data model/migrations retained.                                                                                                                                                                                                   |
| 2026-11-05 | Non-AI backend/UI         | Ingestion, validation/deduplication, public APIs, search/filters, ranking, pagination, related items, exports, operator controls/imports and connected UI delivered. AI endpoints return explicit AI_DISABLED.                                                                                                                                                 |
| 2026-11-05 | Verification              | 7 DB + 22 API/ingestion + 23 frontend logic results pass; source adapters fetched live metadata; first ingestion persisted 91 records; repeat inserted none.                                                                                                                                                                                                   |
| 2026-11-05 | System recovery           | Docker Desktop showed stale engine state/HTTP 500/no route to its Linux VM. Non-destructive restarts and targeted WSL termination were insufficient. User approved Windows UAC for WslService restart; Docker then reported engine 29.8.1 and existing unrelated container resumed. No factory reset, unregister, disk/volume deletion or reinstall performed. |
| 2026-11-05 | Runtime                   | Windows reserved 5432; project DB moved to loopback 55434. App Docker build/start and health checks passed; local smoke reports 91 content records, 8 cooling search results, 14 topics, protected metrics and AI disabled.                                                                                                                                    |
| 2026-11-05 | Browser                   | Live source cards, search, detail, bookmark/history persistence, preference form lifecycle, operator dashboard, theme reload and mobile layout inspected. Screenshots in artifacts/.                                                                                                                                                                           |

## Remaining limits

AI requirements and the model/provider/budget decision are explicitly deferred. No video transcript extraction, semantic search, account sync, notifications or P2 shortcuts are included. Current ingestion does not satisfy the 500-record target. Production hardening/hosting and a full keyboard/accessibility/browser audit remain follow-up work; local smoke tests are not evidence of a public production release.

## Runtime repair — 6 November 2026

The app/database containers were already healthy and the API returned 91 content records, 8 cooling search results and 14 topics. The reported missing data was traced to a stale NewsDC Vite listener on 5173, with additional project listeners on 5174/5176. Confirmed project processes were stopped and one clean frontend was started on 5173. Vite is now configured with explicit loopback host, port 5173 and strictPort, retaining its `/api` proxy to port 5000. Server/database data and credentials were unchanged. Both the complete Docker app on 5000 and the development frontend on 5173 remain available.

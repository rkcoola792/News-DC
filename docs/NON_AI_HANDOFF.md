# Non-AI build handoff

5 November 2026 (Asia/Calcutta).

## Open and test

The app is running at [http://127.0.0.1:5000/](http://127.0.0.1:5000/). Docker app and PostgreSQL containers are healthy. Current collection: **91 live records**, 50 RSS articles and 41 discussions. Video/research lists can be empty until metadata is imported; no demo records were mixed into this collection.

1. Discover: browse, paginate, filter by type/topic, and open **More filters** for publisher/date/score controls. Scores are null while AI is off; minimum-score filters may produce an empty state.
2. Search: search `cooling` (8 results in the verified dataset), combine filters, try an unmatched term, and clear filters. Sorting/pagination stay in the URL.
3. Detail: check publisher/date/author, description, original link, available image/duration/DOI and related items. Missing metadata is explicitly absent. AI is labelled disabled.
4. Saved: bookmark a record, open Saved, reload, then remove it. State is local to the current browser and origin.
5. Preferences: choose multiple topics/formats, Save, reload/revisit, Cancel draft changes, and Reset then Save. ForYou order uses those choices while preserving explicit filters.
6. History: open content, revisit it, reload History, and clear it if desired. Latest 200 unique items are retained locally.
7. Trending/Topics: inspect source-based ranking, timeframe/type filters, all 14 topic counts, and topic feeds.
8. Dashboard: read `ADMIN_API_KEY` from the local root `.env` file, enter it in the operator form, inspect counts/chart/status, toggle a source, and run ingestion. Key is held in UI memory only. Refresh occurs every 15 seconds; full reload locks it again.
9. Imports: Dashboard's metadata form accepts a JSON array (max 100) attributed to a configured discovery source. Supported types: ARTICLE, VIDEO, RESEARCH, DISCUSSION. Required fields: title, HTTP(S) URL, type. Optional description/author/publication date/thumbnail/duration and metadata such as DOI remain optional. Import only permitted metadata. Runs record invalid/duplicate counts.
10. Export: use JSON/Markdown links. Each download contains up to 100 matching records with original attribution/URLs.
11. Theme/mobile: toggle theme, reload, resize to mobile and use the compact/bottom navigation. Ask AI correctly remains disabled.

## Start again later

```sh
docker compose up --build -d
npm run smoke
```

For a fresh checkout: `npm install`, `npm run setup:local`, then the Docker command. Do not run `docker compose down -v` unless you intend to erase the local database volume. Scheduler defaults off; use manual ingestion or set `INGESTION_ENABLED=true`.

## What is intentionally absent

AI relevance/classification, generated summaries/insights/scores, emerging AI trend synthesis, assistant answers/citations and transcripts are deferred by user instruction. No LLM credential is required. This phase uses transparent metadata rules and source-provided descriptions. P2 accounts/sync/vector search/notifications/shortcuts remain outside MVP.

## Verified evidence and limits

52 automated passing results; real PostgreSQL enabled. Source fetches and persistent ingestion succeeded, re-ingestion added zero duplicates, Docker build/start/health and SPA/API/operator smoke checks passed. Browser smoke verified selected live screens and local persistence. Primary/secondary text contrast checks pass in both themes; 320px Discover had no horizontal overflow. A full accessibility/keyboard/browser matrix, public hosting and the 500-relevant-record target are not yet complete.

Initial local infrastructure faults were repaired without factory reset or data deletion: stale Docker/WSL engine required an administrator-approved WSL service restart. The project's DB uses loopback port 55434 because Windows reserved 5432.

## Feedback to provide

Report the screen, action, expected result, observed result and any visible error. Do not paste operator/database secrets. We can resolve acceptance issues before starting AI integration. Provider/model/budget and hosting remain open decisions for the next phase.

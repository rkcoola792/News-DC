# Non-AI build handoff

> Current implementation update — 6 November 2026: cited assistant, automatic enrichment, cached/source-linked trends, research backfill and approved YouTube public metadata are implemented. See [ASSISTANT_AUTOMATION.md](ASSISTANT_AUTOMATION.md) for current contracts/evidence; older pending/deferral notes below are historical. Full user acceptance, relevance dataset review and public deployment remain open.

Updated 6 November 2026 (Asia/Calcutta).

## Open and test

The app is running at [http://127.0.0.1:5000/](http://127.0.0.1:5000/). Docker app and PostgreSQL containers are healthy. Current collection: **141 live records**, 50 RSS articles, 41 discussions and 50 automatically ingested arXiv papers. No demo records were mixed into this collection. Video lists can remain empty until permitted metadata is imported.

1. Discover: browse, paginate, filter by type/topic, and open **More filters** for publisher/date/score controls. Scores are null while AI is off; minimum-score filters may produce an empty state.
2. Search: search `cooling` (17 results in the verified dataset), combine filters, try an unmatched term, and clear filters. Filter to Research and search `thermal` (2 results), then open a paper to inspect source abstract, authors, tags and original link. Sorting/pagination stay in the URL.
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

## Research update — 6 November 2026

Live arXiv metadata ingestion added 50 papers; total 141 actual records. Repeat inserted zero duplicates. Current API/ingestion suite: 35 passing results with real isolated PostgreSQL, no skips; previous same-day DB/frontend suites: 7/23 pass. Live research search/detail and full smoke pass. See RESEARCH_INGESTION.md. No new browser acceptance audit is claimed. AI remains disabled; approximately $10 available OpenAI credit is not an agreed spending cap. Provider/model and a small demo budget remain decisions for the AI phase.

## Reliability handoff — 6 November 2026

Scheduler promise failures are contained; overlap and failure recovery have regression coverage. Real one-minute scheduling/source-failure and isolated database outage/reconnect passed through `npm run test:reliability`. Demo database stays intact; scheduler remains opt-in/off. Research detail topics now wrap correctly at 320px. Keyboard search, research filtering, detail navigation and bookmark Saved/reload/removal were verified. API suite now passes 38 results. See AI_DEMO_PLAN.md for the user-approved next-phase planning: Gemini free tier preferred, $0 target, no paid fallback, $1 initial ceiling reserved for any separately agreed paid use. No live AI calls made.

## AI provider routing update — 6 November 2026

Both server-side keys are configured. Dashboard now has protected connection checks: Gemini first, two temporary-failure retries, then one OpenAI fallback. User removed application spending/daily caps; usage is informational/persistent and provider quotas/retry/timeouts remain. No need to paste keys again. Provider routing is implemented and live-probed; enrichment and assistant remain the next implementation. See AI_PROVIDER_ROUTING.md for exact behavior and verification, superseding the earlier planning/cap notes in this handoff.

## Enrichment handoff — 6 November 2026

Dashboard → unlock → Content enrichment → select source-rich records → Enrich selected records. Inspect Recent processing history. Open a completed item to see labeled AI summary, insights, intelligence type, abstract/text scope, and expandable scores/evidence. Thin metadata and video without a permitted transcript skip. Current saved outputs are reused; no provider calls occur on page reads. Two research abstracts are enriched in the real 141-record collection; all other 139 remain unprocessed. Keys/provider order/no spending-daily-cap policy stay unchanged. See CONTENT_ENRICHMENT.md. Next feature: the cited assistant, still disabled until implemented.

# Cited assistant, automatic processing and source coverage

Updated: 6 November 2026 (Asia/Calcutta).

## Delivered scope

This increment completes the implementation of F31/F32 (PRD FR-14), F13, automatic processing after ingestion (FR-03/05–08), and F41/F43 public video metadata. It retains the approved React/Vite, Express, PostgreSQL/Prisma modular monolith. P2 features remain excluded. Public deployment and full user acceptance come after this build.

## Assistant contract

- `GET /api/v1/assistant/status` returns safe enabled/busy flags without calling an LLM.
- `POST /api/v1/assistant/ask` accepts a question of 3–500 characters and optional `filters`: `contentTypes`, `categorySlugs`, `dateFrom`, `dateTo`. Unknown fields and reversed date ranges return 400.
- Prisma PostgreSQL full-text retrieval ranks at most 80 candidate rows, then selects at most five excerpts of at most 1,000 characters. Known AI-irrelevant rows are excluded. This is lexical retrieval with reviewed aliases, not semantic/vector search or live browsing.
- The model receives bounded evidence and temporary source IDs. Every factual answer paragraph must reference only retrieved IDs. Backend links come from stored URLs; model URLs, unknown IDs and unsupported paragraph shapes are rejected. Validation cannot prove semantic entailment: human source comparison remains part of acceptance.
- The response contains `answer`, `paragraphs`, `sources`, `insufficientEvidence`, `limitations`, `retrieval`, `provider`, `model`, `cached`. Sources retain publisher/date/content type/text scope and link to indexed detail and original source. Research abstracts are explicitly identified; metadata never implies a watched video.
- Empty retrieval returns insufficient evidence without a model call. When excerpts cannot answer, the model must return an explicit insufficient-evidence result. A partial collection does not guarantee an answer to every example question.
- Validated answers persist in `ai_output_cache` for 24 hours, keyed by prompt version, normalized question, filters and actual evidence. Changed evidence invalidates reuse. Questions are independent; the UI shows up to five answers in component memory and offers clear conversation. It does not send earlier conversation turns.
- The browser keeps a failed question for retry, exposes loading/error/disabled states and supports evidence filters. React renders returned text without raw HTML.

## Automatic processing and trend reports

Set backend `AI_PROVIDER_ENABLED=true` and `AI_AUTO_ENRICHMENT=true`. `AI_AUTO_INTERVAL_MS=5000` is the default polling interval. Fresh examples default automatic AI to false; the current local workspace enables it. `INGESTION_ENABLED=true` separately enables source refresh every `INGESTION_INTERVAL_MS` (default 30 minutes).

One shared provider gateway serves enrichment, assistant and reports. Background work defers while interactive generation or operator enrichment is active. Thin rows are marked skipped without a model call; each rich row is processed through the existing validated enrichment pipeline. New/changed rows become pending. Failures are visible and require explicit operator retry rather than an endless paid retry loop. Persisted pause/resume survives restart, and an in-flight request finishes before pausing. Interrupted processing/backfill is marked failed at startup; completed records/runs remain intact.

Protected operator routes:

| Method    | Route                       | Behavior                                               |
| --------- | --------------------------- | ------------------------------------------------------ |
| GET/PATCH | `/admin/ai/automation`      | Status/counts; PATCH `{ "paused": true }` or false     |
| POST      | `/admin/ai/trends/refresh`  | Empty object; refresh a validated, cached theme report |
| GET/POST  | `/admin/ingestion/backfill` | Progress; POST `{ "pages": 12 }`, allowed 1–12         |

All paths above are relative to `/api/v1`. Existing operator Bearer authentication applies. Public `GET /trends` only reads counts/cache, never generates. Trend comparison uses publication dates in the latest seven days versus the previous seven; up to 1,000 recent rows, rising topics with at least two current items, top three topics and three source examples each. A validated synthesis cites only sources for that topic. Reports cache for an hour and refresh automatically after pending work drains, or manually. Counts describe indexed coverage and do not establish industry-wide trends. Changed evidence/counts invalidates a report.

## Research and video discovery

Research backfill uses only the approved arXiv title query, 50 records per page and reviewed offsets 0–550. Existing single-connection/three-second source spacing and deduplication apply. Progress/run IDs persist in PostgreSQL. No additional source account or API key is required.

The user explicitly approved public YouTube oEmbed metadata for YouTube links discovered through the approved Hacker News adapter. Up to five matching links per source fetch use a fixed YouTube oEmbed endpoint with bounded response/timeout and no redirects. Only exact supported YouTube hosts and valid video IDs qualify. The adapter extracts title, channel and an allowed thumbnail when supplied. Missing duration/publication date remain null; the HN timestamp is `metadata.discoveredAt`, not video publication time. An existing HN discovery record is converted in place and retains its ID. Metadata failures preserve discoverable video links with visible status. No videos or transcripts are downloaded. Video enrichment still requires a permitted transcript, which is excluded from this MVP.

## Verification and remaining acceptance

- API/integration suite: 71 passing results with real isolated PostgreSQL, zero skips. New checks cover source ID rejection, URL restrictions, safe video failure, existing record conversion, answer cache/restart/evidence changes, retrieval filters, insufficient evidence, provider failure recovery, read-only trends, report cache, persisted pause and backfill concurrency/recovery.
- Database foundation: 7 passing results, including all six migrations and repeat migration no-op. Frontend local-state logic: 23 passing results.
- Real Gemini answered AI infrastructure, hyperscaler investment, and cooling/power questions with indexed citations. GPU utilization and combined PUE/WUE questions returned explicit insufficient evidence, including after relevance-ranked retrieval was checked. Unchanged repeat requests reused persisted responses. Refusing an unsupported question is expected behavior, not fabricated completion.
- Backfill completed 12 pages: 550 inserted, 50 duplicates skipped, zero failures. Subsequent HN refresh verified two real videos with channel/thumbnail, absent publication date and no transcript. Snapshot: 702 indexed records (600 research, 50 articles, 50 discussions, 2 videos). These are not 702 AI-confirmed relevant records.

The final user acceptance pass must compare AI claims with sources, review relevance/quality samples, exercise the complete UI and confirm failure recovery. The 500-relevant-record target remains open while background classification runs; Dashboard reports confirmed relevant, excluded and unclassified separately. Select hosting and deploy only after testing, as requested. No app spending or fixed daily request caps were introduced; Gemini-first/two temporary retries/one OpenAI fallback and usage accounting remain unchanged.

Focused browser checks verified assistant citations, source-linked trend expansion, video metadata and 320px assistant/video fit without horizontal overflow. Screenshots are in artifacts/assistant-citations-verified.png, artifacts/assistant-mobile-verified.png and artifacts/video-mobile-verified.png. Background processing was resumed after interactive checks. At that snapshot, only 9 rows were AI-confirmed relevant; Dashboard is the source of current processing/coverage counts.

# Content enrichment — F7–F12

6 November 2026. Implements operator-triggered, persisted enrichment through the existing Gemini-first gateway (two temporary-failure retries, then one OpenAI fallback). No application spending/daily caps are added. Assistant implementation remains a separate next increment.

## Behavior and evidence boundary

An operator selects 1–10 stored records for a reviewable asynchronous batch. This is a per-request work bound, not a monetary/daily allowance. The endpoint creates persistent processing log IDs and returns immediately. The in-process runner processes sequentially; interrupted pending/processing work is marked failed on startup for an explicit retry. Prompt-version changes clear stale scores, relevance and AI topics at startup. There is no distributed queue or automatic full-collection processing.

Input is normalized title, source type, supplied description/body (first 6,000 characters), publisher domain, publication date and evidence scope. Titles are bounded to 1,000 characters. Research with only an abstract is labeled abstract-only. No PDFs, external article bodies or transcripts are downloaded. Video content enrichment requires stored text and an explicit permitted-transcript flag. Other records require at least 25 words and 160 characters of source text; thin records are skipped without a provider call or invented summary.

The versioned structured contract covers:

- Data center relevance flag/confidence/reason.
- Up to five unique slugs from the existing 14-topic taxonomy.
- NEWS, TECHNICAL_RESEARCH, INVESTMENT_INTELLIGENCE, ENGINEERING_IDEA or OTHER intelligence type.
- Summary, up to three insights, and exact source quotes supporting them.
- Relevance and quality scores with explanations. They are model-assisted estimates, not objective credibility ratings.

Prompt/contract version newsdc-enrichment-v2 supplies bounded original excerpts with IDs. The model selects those IDs; the application validates them, resolves them to the original text and validates the public result again. Zod checks types, enum values, score/length bounds, required topics and duplicate categories. Each resolved quote must occur verbatim in normalized supplied text. Irrelevant/insufficient-evidence responses must omit summary, insights and quality score. Quote matching checks evidence presence, not semantic entailment of every generated claim; human review and source links remain necessary for demo-quality assessment. Source text is treated as untrusted evidence, never instructions.

## Persistence, reuse and source changes

Existing content_items fields, content_category_map and content_processing_logs are reused through Prisma; no new schema migration is needed. Source tags remain separate from AI-controlled topics. Metadata stores prompt/input hash, provider/model, attempts, evidence scope, quotes, explanations and rubric version. Generated output is saved atomically with category mappings and processing status.

Unchanged successful input/prompt version reuses saved output without another provider call. Ingestion refresh compares the model input hash: changed text/date/scope invalidates output/scores/relevance and restores metadata topic rules. Unchanged source/tag refresh preserves current AI results. Output generated while the source changes is discarded, and processing ownership guards avoid overwriting another task. Unrelated metadata such as engagement does not invalidate an input that never included it.

There are no model calls on content list/detail/search reads. Currentness is checked at serialization, and source-driven invalidation clears stored generated fields. Failed processing never fabricates an answer. Irrelevant records remain in the database/operator views but are excluded from public feeds, search, related results and visible topic counts.

## API and UI

- GET /api/v1/admin/ai/enrichment: enabled/busy, up to 50 recent candidates with eligibility/cache status, up to 30 persistent processing logs. Operator authentication required.
- POST /api/v1/admin/ai/enrichment with {"contentIds":["UUID"]}: strict unique UUID array, 1–10 items. Returns 202/runIds; unknown records 404; concurrent batch 409; disabled provider 503. No arbitrary prompt is accepted.
- Existing content/summary DTO ai fields now include currentness, summary/insights, classification, relevance/confidence/quality, explanations, provider/model/date, evidence scope and quotes. Non-current generated values are not displayed. Assistant remains disabled until implemented.

Dashboard controls select candidates and inspect progress/history, independently of periodic metrics refresh. Detail labels the AI summary and abstract/source-text limitations; insight/evidence and explained scores are available in the detail view. Feed summaries are labeled when AI-generated; scores are kept in expandable detail, consistent with the design specification.

ForYou/Trending keep their existing preference/freshness/engagement base ranking and add 0.40 × stored relevance + 0.25 × stored quality only for current successful enrichment. Missing signals add zero rather than invented scores. Candidate cap remains 1,000. Full-text search now also matches saved summaries. Original attribution/links and browser-local user state remain.

## Verification and remaining work

The isolated API suite passes 61 results with real PostgreSQL. New tests cover schema/evidence constraints, input hashing, persistence/API round-trips, source-tag retention, search/ranking integration, cached reuse, asynchronous operator queuing, thin/video skips, invalid evidence/provider failure, source refresh during generation, irrelevant-item filtering and restart recovery. Fixtures remain in generated test schemas; none are inserted into development data.

Live source and browser evidence is recorded in IMPLEMENTATION_STATUS.md after execution. Not every stored item is classified; the 500-relevant-record target is still open. Automatic enrichment following ingestion is not connected in this operator-batch increment. Next: the collected-content assistant with validated citation IDs and insufficient-evidence behavior, followed by broader quality/automation/delivery acceptance.

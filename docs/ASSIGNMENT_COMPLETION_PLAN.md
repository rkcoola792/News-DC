# Assignment completion plan — PRD/MVP audit

Updated: 6 November 2026 (Asia/Calcutta). The original audit was planning only; the user subsequently approved automatic research ingestion before AI work.

## Baseline and decisions

Scope comes from PRD.md, MVP_SCOPE.md, FEATURES.md and TRACEABILITY.md. Keep React/Vite JavaScript/JSX, Tailwind, Lucide, React Router, Express, PostgreSQL, Prisma and Docker. Keep user state browser-local without registration. The user approved Gemini-first provider integration with OpenAI fallback, then removed application spending/daily caps. Routing is delivered; enrichment and assistant remain next stages.

## Delivered and evidenced

- API/RSS adapters for approved Hacker News, Data Center Knowledge and arXiv sources; normalization, validation, canonical/fingerprint deduplication and ingestion run tracking.
- PostgreSQL persistence and Prisma queries for four content formats; all 14 configured topics.
- Connected Discover, Trending, topic feeds, detail/original/related links, full-text search, combined filters and pagination.
- Local bookmarks, reading history and saved preferences; theme persistence and responsive shell.
- Protected operator metrics, source enable/disable, manual ingestion, metadata import and source failure history.
- JSON/Markdown export (100-record cap), health/error handling, local Docker app/database, documentation and test infrastructure.

Latest executed evidence on 6 November: 23 frontend logic and 7 database results passed before research implementation; the expanded API suite now passes 48 results, no skips. A real 60-second scheduled interval and isolated database outage/recovery also passed. Live smoke passed with 141 records, 17 cooling search results, 14 topics, protected metrics and AI disabled. Research ingestion inserted 50 papers; repeat ingestion inserted zero duplicates. These records are metadata-filtered, not AI-verified relevant records.

## Gaps against the final requirements

| Area                         | Feature IDs               | What remains                                                                                                                                                                                                                        |
| ---------------------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Complete metadata extraction | F2                        | Completed 6 November: source/import tags now flow through validation, Prisma mappings, API/JSON export and detail UI. See F2_TAGS.md.                                                                                               |
| AI intelligence              | F7–F12                    | Relevant flag/confidence/reason, validated AI categorization, summaries, insights, explained scoring and controlled intelligence classification. Currently deferred; keyword labels and publisher descriptions are not substitutes. |
| Full recommendations/detail  | F14/F15/F23/F27           | Current non-AI behavior is usable; integrate real stored enrichment/quality signals and score explanations when AI is approved. Do not invent missing signals.                                                                      |
| Grounded assistant           | F31/F32                   | PostgreSQL retrieval, bounded context, grounded answers, citation-ID validation, source links and insufficient-evidence behavior. Current assistant is explicitly disabled.                                                         |
| Dataset target               | PRD/traceability          | Actual 141 records versus the 500-relevant-record target where source access permits. Add permitted backfill/source coverage and report actual relevant count after classification. Never seed fake records to satisfy it.          |
| Verification                 | TESTING_AND_ACCEPTANCE.md | Full user acceptance pass, combined browser workflows, keyboard/focus/mobile checks, actual scheduled refresh and failure/restart behavior. Timer invocation tests alone do not prove a long-running schedule.                      |
| Delivery                     | F35/F37/F38               | Public deployment URL, production configuration/secret controls, persistent storage/backups, deployed smoke tests, clean setup and final repository/demo evidence. Local Docker is verified; public hosting is not.                 |
| Optional format enrichment   | F41–F44 (P1)              | Automatic arXiv research discovery is delivered. Live video metadata extraction (F43) still requires a permitted source; imports alone do not close that gap. No transcript work is required for MVP.                               |
| Optional AI trends           | F13 (P1)                  | Supported trend synthesis and linked evidence; deferred along with AI.                                                                                                                                                              |
| Future scope                 | F30/P2                    | Shortcuts, vectors, accounts/sync, notifications, multilingual and advanced administration stay deferred.                                                                                                                           |

## Proposed order and exit criteria

1. **F2 metadata extraction — completed 6 November 2026.** Add optional validated tags to the normalized record, preserve source-provided tags, persist deduplicated tag relationships using Prisma and return/display them. Verify missing tags, malformed tags, repeated ingestion and query/detail round-trips. No LLM key needed.
2. **Non-AI acceptance and reliability — focused pass completed 6 November.** Fixed unhandled scheduled rejections and mobile topic wrapping. Real 60-second scheduling, source failure, isolated database outage/recovery, keyboard research/search/bookmark flows and 320px detail/Topics passed. Full user acceptance/accessibility/browser matrix remains a final verification task; do not claim exhaustive coverage.
3. **Provider routing — delivered.** Both keys are server-side. Gemini-first routing, two temporary-failure retries, one OpenAI fallback, persisted usage and operator controls are implemented and live-probed. User removed spending/daily caps. Refusal, timeout, Retry-After and overlap safeguards remain. See AI_PROVIDER_ROUTING.md. Next: enrichment in step 4.
4. **Build/test enrichment (F7–F12).** Start with relevance/confidence/reason and controlled categorization, then classification, summaries/insights and versioned scoring. Persist validated output/provenance, failures and bounded retry. Check weak text and video-without-transcript cases. Connect stored output to detail/filters/ranking. Exit: inspectable grounded enrichment and reliable failure behavior.
5. **Build/test assistant (F31/F32).** Retrieve stored evidence with PostgreSQL, generate only from it, validate citations and test insufficient evidence and unknown citations. Exit: answer-to-source demo with working original links.
6. **Dataset and final verification.** Backfill/add only permitted sources toward 500 relevant records where feasible, verify repeated-ingestion counts and report achieved coverage/limitations. Run the full automated/browser acceptance suite after integration. Earlier ingestion/backfill can run in parallel once permitted sources are decided.
7. **Delivery.** Choose hosting, deploy the existing Docker stack, run migrations/configure secrets and backups, verify public flows, finalize repository/README/architecture/demo notes and deployment link. Optional P1 additions follow only if time allows.

## Acceptance discussion before implementation

F2, automatic research discovery, focused reliability and provider routing are delivered. User authorized Gemini-first/OpenAI-fallback integration and removed spending/daily caps. Next: a small selected enrichment batch, then grounded assistant with validated citations. Mark feature IDs complete only after real implementation and acceptance. Keep credentials server-side.

## Assignment screenshot clarification — 6 November 2026

The original screenshots and acceptance mapping are preserved in [ASSIGNMENT_ACCEPTANCE_REFERENCE.md](ASSIGNMENT_ACCEPTANCE_REFERENCE.md). Prioritize a working end-to-end news/research MVP over feature count. Automatic research discovery now has verified live arXiv coverage. Collected-content answers with supporting links (F31/F32), AI relevance and quality remain required but deferred; metadata rules are not substitutes.

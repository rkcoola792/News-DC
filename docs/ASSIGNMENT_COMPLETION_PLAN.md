# Assignment completion plan — PRD/MVP audit

Audit date: 6 November 2026 (Asia/Calcutta). Planning/documentation only; no feature implementation authorized by this audit.

## Baseline and decisions

Scope comes from PRD.md, MVP_SCOPE.md, FEATURES.md and TRACEABILITY.md. Keep React/Vite JavaScript/JSX, Tailwind, Lucide, React Router, Express, PostgreSQL, Prisma and Docker. Keep user state browser-local without registration. The user's instruction to defer AI remains in effect until explicitly changed.

## Delivered and evidenced

- API/RSS adapters for approved Hacker News and Data Center Knowledge sources; normalization, validation, canonical/fingerprint deduplication and ingestion run tracking.
- PostgreSQL persistence and Prisma queries for four content formats; all 14 configured topics.
- Connected Discover, Trending, topic feeds, detail/original/related links, full-text search, combined filters and pagination.
- Local bookmarks, reading history and saved preferences; theme persistence and responsive shell.
- Protected operator metrics, source enable/disable, manual ingestion, metadata import and source failure history.
- JSON/Markdown export (100-record cap), health/error handling, local Docker app/database, documentation and test infrastructure.

Latest full automated evidence is from 5 November: 52 passing test results (23 frontend logic, 7 database, 22 API/ingestion including nested tests). This audit did not rerun that full suite. Fresh 6 November `npm run smoke` passed: 91 records, 8 cooling search results, 14 topics, healthy API, protected metrics and AI disabled. These records are metadata-filtered, not AI-verified relevant records.

## Gaps against the final requirements

| Area                         | Feature IDs               | What remains                                                                                                                                                                                                                        |
| ---------------------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Complete metadata extraction | F2                        | Completed 6 November: source/import tags now flow through validation, Prisma mappings, API/JSON export and detail UI. See F2_TAGS.md.                                                                                               |
| AI intelligence              | F7–F12                    | Relevant flag/confidence/reason, validated AI categorization, summaries, insights, explained scoring and controlled intelligence classification. Currently deferred; keyword labels and publisher descriptions are not substitutes. |
| Full recommendations/detail  | F14/F15/F23/F27           | Current non-AI behavior is usable; integrate real stored enrichment/quality signals and score explanations when AI is approved. Do not invent missing signals.                                                                      |
| Grounded assistant           | F31/F32                   | PostgreSQL retrieval, bounded context, grounded answers, citation-ID validation, source links and insufficient-evidence behavior. Current assistant is explicitly disabled.                                                         |
| Dataset target               | PRD/traceability          | Actual 91 records versus the 500-relevant-record target where source access permits. Add permitted backfill/source coverage and report actual relevant count after classification. Never seed fake records to satisfy it.           |
| Verification                 | TESTING_AND_ACCEPTANCE.md | Full user acceptance pass, combined browser workflows, keyboard/focus/mobile checks, actual scheduled refresh and failure/restart behavior. Timer invocation tests alone do not prove a long-running schedule.                      |
| Delivery                     | F35/F37/F38               | Public deployment URL, production configuration/secret controls, persistent storage/backups, deployed smoke tests, clean setup and final repository/demo evidence. Local Docker is verified; public hosting is not.                 |
| Optional format enrichment   | F41–F44 (P1)              | Four-format storage/import/detail support exists, but automatic live video/research metadata sources are absent. Imports alone do not close public video metadata extraction (F43). No transcript work is required for MVP.         |
| Optional AI trends           | F13 (P1)                  | Supported trend synthesis and linked evidence; deferred along with AI.                                                                                                                                                              |
| Future scope                 | F30/P2                    | Shortcuts, vectors, accounts/sync, notifications, multilingual and advanced administration stay deferred.                                                                                                                           |

## Proposed order and exit criteria

1. **F2 metadata extraction — completed 6 November 2026.** Add optional validated tags to the normalized record, preserve source-provided tags, persist deduplicated tag relationships using Prisma and return/display them. Verify missing tags, malformed tags, repeated ingestion and query/detail round-trips. No LLM key needed.
2. **Non-AI acceptance and reliability.** Walk every connected screen using the handoff. Verify scheduler on an actual interval and observe unavailable-database/source recovery. Review scheduled promise rejection handling before calling the unattended path complete. Fix confirmed defects without adding product scope. Exit: logged passes/failures and no unresolved demo blockers.
3. **Approve AI scope and configuration.** Decide provider/model, usage cap and permitted input text. Keep secrets server-side. No provider selection or credential request is made in this planning turn. Existing deferral is not lifted automatically.
4. **Build/test enrichment (F7–F12).** Start with relevance/confidence/reason and controlled categorization, then classification, summaries/insights and versioned scoring. Persist validated output/provenance, failures and bounded retry. Check weak text and video-without-transcript cases. Connect stored output to detail/filters/ranking. Exit: inspectable grounded enrichment and reliable failure behavior.
5. **Build/test assistant (F31/F32).** Retrieve stored evidence with PostgreSQL, generate only from it, validate citations and test insufficient evidence and unknown citations. Exit: answer-to-source demo with working original links.
6. **Dataset and final verification.** Backfill/add only permitted sources toward 500 relevant records where feasible, verify repeated-ingestion counts and report achieved coverage/limitations. Run the full automated/browser acceptance suite after integration. Earlier ingestion/backfill can run in parallel once permitted sources are decided.
7. **Delivery.** Choose hosting, deploy the existing Docker stack, run migrations/configure secrets and backups, verify public flows, finalize repository/README/architecture/demo notes and deployment link. Optional P1 additions follow only if time allows.

## Acceptance discussion before implementation

F2 tags/metadata completion is now delivered. Next is the non-AI acceptance and reliability pass in step 2; discuss any resulting feature work before implementing it. After non-AI acceptance, explicitly decide whether to lift the AI deferral. Hosting access will be needed only for public deployment; LLM configuration/credentials only for the approved AI phase. Do not share credentials in planning documents.

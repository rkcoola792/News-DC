# Historical implementation snapshots

These entries describe earlier increments. Current status is in IMPLEMENTATION_STATUS.md.

# NewsDC implementation tracker

Updated: 5 November 2026 (Asia/Calcutta).

Source of scope: [FEATURES.md](FEATURES.md). Specifications describe intended behavior; this file records implementation evidence. Preview data is illustrative and is not evidence of ingestion or AI processing.

## Status definitions

- **Pending:** not implemented.
- **UI preview:** layout exists, but the feature acceptance criteria are not fulfilled.
- **Partial:** some required behavior exists; remaining work is listed.
- **Implemented; browser QA pending:** implementation exists, with remaining browser verification explicitly tracked. This is not full acceptance sign-off.
- **Verified:** applicable checks for the named scope executed successfully. F39 database foundation has PostgreSQL integration evidence; no consumer screen has full browser/end-to-end acceptance evidence.
- **Deferred P2:** excluded from initial MVP implementation sequence.

## Current delivery snapshot

Implementation complete for the local versions of **F18 reading history, F19 preferences, F25 bookmarks, and F28 theme**. Browser acceptance is still pending; theme contrast checks are also pending. This is not a claim of full end-to-end acceptance.

**Partial:** F14/F20 local ForYou ordering; F16/F22 full topic directory and sample topic feeds; F24/F45 sample text search; F27/F40 filters; F37/F38 ongoing documentation and change tracking.

**UI previews only:** Trending, content detail, AI assistant, and operational dashboard. There are no live source records or AI processing. Express health endpoints, versioned PostgreSQL migrations, an internal content repository, and a local database Compose service are now implemented; UI content remains sample-only.

Current executed logic checks: **23 pass** (8 ranking/selection, 7 preferences, 5 history, 3 bookmarks). Earlier 5/12/20-test entries below are historical snapshots, not the latest test count.

**Next increment:** F2/F5 metadata normalization and validation, then F3 URL/fingerprint deduplication. F39 persistence and backend health foundation are verified; see the latest entry below.

## Feature inventory

| ID  | Feature                     | Priority    | Status                          | Evidence / remaining work                                                                                                                                                                                 |
| --- | --------------------------- | ----------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1  | Source ingestion            | P0          | Pending                         | Not implemented.                                                                                                                                                                                          |
| F2  | Metadata extraction         | P0          | Pending                         | Not implemented.                                                                                                                                                                                          |
| F3  | Duplicate detection         | P0          | Pending                         | Not implemented.                                                                                                                                                                                          |
| F4  | Scheduled refresh           | P0          | Pending                         | Not implemented.                                                                                                                                                                                          |
| F5  | Content validation          | P0          | Pending                         | Not implemented.                                                                                                                                                                                          |
| F6  | Source management           | P1          | Pending                         | Not implemented.                                                                                                                                                                                          |
| F7  | Relevance detection         | P0          | Pending                         | Not implemented.                                                                                                                                                                                          |
| F8  | Categorization              | P0          | Pending                         | Not implemented.                                                                                                                                                                                          |
| F9  | Summarization               | P0          | Pending                         | Not implemented.                                                                                                                                                                                          |
| F10 | Insight extraction          | P0          | Pending                         | Not implemented.                                                                                                                                                                                          |
| F11 | Quality scoring             | P0          | Pending                         | Not implemented.                                                                                                                                                                                          |
| F12 | Content classification      | P0          | Pending                         | Not implemented.                                                                                                                                                                                          |
| F13 | Trend detection             | P1          | Pending                         | Not implemented.                                                                                                                                                                                          |
| F14 | ForYou                      | P0          | Partial                         | Discover preview now ranks with saved topic/type preferences and history. Eight ranking/selection tests pass. Live server ranking and browser QA pending.                                                 |
| F15 | Trending                    | P0          | Pending                         | Not implemented.                                                                                                                                                                                          |
| F16 | Topic feed                  | P0          | Partial                         | Topic query filters the five local preview records; no API.                                                                                                                                               |
| F17 | Related content             | P1          | Pending                         | Not implemented.                                                                                                                                                                                          |
| F18 | Reading history             | P0          | Implemented; browser QA pending | Local history hook and /history screen; revisits, clear, validation, 200-item limit. Five utility tests pass; browser integration unverified.                                                             |
| F19 | Preferences                 | P0          | Implemented; browser QA pending | /preferences supports 14 topics and four types, draft edits, Save/Cancel/Reset, validated local persistence and save-failure feedback. Seven preference logic tests pass; browser interaction QA pending. |
| F20 | Home / ForYou               | P0          | Partial                         | Discover renders sample content with local preference/history ordering. API-backed feed, pagination and browser QA pending.                                                                               |
| F21 | Trending                    | P0          | UI preview                      | Ranked-looking sample list; no trending endpoint or live ranking.                                                                                                                                         |
| F22 | Topics                      | P0          | Partial                         | Full 14-topic PRD taxonomy now supplies the directory and filters; API-backed feeds/counts and browser QA pending.                                                                                        |
| F23 | Content detail              | P0          | UI preview                      | Local ID lookup, summary panel and score placeholder; verified metadata, original links and related content pending.                                                                                      |
| F24 | Search                      | P0          | Partial                         | Substring search over local samples; PostgreSQL full-text search pending.                                                                                                                                 |
| F25 | Bookmarks                   | P0          | Implemented; browser QA pending | Local save/unsave, Saved list, malformed storage recovery, and failed-write feedback. Three storage tests pass; browser verification pending.                                                             |
| F26 | Dashboard                   | P1          | UI preview                      | Explicit disconnected states; no operational metrics.                                                                                                                                                     |
| F27 | Filters and sorting         | P0          | Partial                         | Type/topic/text filters combine; title sort exists. Date/publisher/score filters pending.                                                                                                                 |
| F28 | Theme                       | P1          | Implemented; browser QA pending | Theme toggle and localStorage preference exist; contrast/browser checks pending.                                                                                                                          |
| F29 | Pagination/infinite loading | P0          | Pending                         | Not implemented.                                                                                                                                                                                          |
| F30 | Keyboard shortcuts          | P2          | Deferred P2                     | Future scope.                                                                                                                                                                                             |
| F31 | AI research assistant       | P0          | UI preview                      | Prompt suggestions/composer and disconnected reply only; retrieval and generation pending.                                                                                                                |
| F32 | Source references           | P0          | Pending                         | Not implemented.                                                                                                                                                                                          |
| F33 | JSON export                 | P1          | Pending                         | Not implemented.                                                                                                                                                                                          |
| F34 | Markdown export             | P1          | Pending                         | Not implemented.                                                                                                                                                                                          |
| F35 | Docker deployment           | P0          | Partial                         | Local PostgreSQL Compose service exists. API/client/worker image packaging and full deployment verification pending.                                                                                      |
| F36 | Logging/error handling      | P0          | Partial                         | Request IDs, safe JSON health/error responses and structured API logs implemented. Source/AI failure reporting remains pending.                                                                           |
| F37 | Documentation               | P0          | Partial                         | Specification docs exist; current README refreshed. Clean setup and deployment unverified.                                                                                                                |
| F38 | AI-assisted development log | P0          | Partial                         | This tracker records implementation and executed checks; ongoing updates required.                                                                                                                        |
| F39 | Multi-format content model  | P0          | Verified (database foundation)  | PostgreSQL schema and parameterized repository round-trip all four types; migrations/taxonomy/constraints verified on PostgreSQL 16. Ingestion and UI/API integration are separate pending work.          |
| F40 | Content-type filter         | P0          | Partial                         | Type filtering implemented on local samples; API and browser validation pending.                                                                                                                          |
| F41 | Video discovery             | P1          | Pending                         | Not implemented.                                                                                                                                                                                          |
| F42 | Video detail                | P1          | Pending                         | Not implemented.                                                                                                                                                                                          |
| F43 | Video metadata extraction   | P1          | Pending                         | Not implemented.                                                                                                                                                                                          |
| F44 | Research discovery          | P1          | Pending                         | Not implemented.                                                                                                                                                                                          |
| F45 | Unified search              | P0          | Partial                         | Local text search covers four preview formats; indexed search and actual publisher/source attribution pending.                                                                                            |
| F46 | Operational observability   | Recommended | Pending                         | No run tracking, AI retry logs, or protected manual trigger.                                                                                                                                              |

## Implementation order

Work in individual increments and update this inventory and verification log with each change. P0 comes before optional P1/P2 work.

1. Local reading history (F18): implementation complete; browser QA pending.
2. Persistent topic/type preferences (F19) and full topic directory implemented; browser QA pending. ForYou preview ranking is now implemented (F14 partial); backend/database foundation is next.
3. Backend/database foundation and common content schema (F39): verified. Next: validation/metadata (F2/F5), then deduplication (F3).
4. Source adapters (F1), scheduled ingestion (F4), logs and observability (F36/F46). Initial sources remain an open decision.
5. AI processing (F7–F12), after provider/model/budget decisions.
6. API-backed feed, search, filters, pagination, detail, trending (F15/F16/F20–F24/F27/F29/F40/F45).
7. Grounded assistant and validated citations (F31/F32).
8. Docker and acceptance verification (F35), documentation/log updates throughout (F37/F38).
9. Optional P1 features after the core works; P2 remains deferred.

## Verification and change log

| Date       | Feature       | Change / executed check                                                                                 | Result        | Limits                                                                                                                                   |
| ---------- | ------------- | ------------------------------------------------------------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-11-05 | UI foundation | React routes, preview screens, local bookmarks/theme, sample filters                                    | Implemented   | Earlier production build passed; browser behavior not verified.                                                                          |
| 2026-11-05 | F18           | Record opening, deduplicate/move latest first, bounded local persistence, history view and clear action | Implemented   | Browser route and interaction verification pending.                                                                                      |
| 2026-11-05 | F18           | `node --test apps/web/src/utils/readingHistory.test.js`                                                 | PASS: 5 tests | Covers reorder/deduplication, malformed input, size cap, reload/clear, storage failure reporting. Uses in-memory storage, not a browser. |
| 2026-11-05 | Frontend      | `npm run build` after history integration                                                               | PASS          | Production compilation only; not visual/accessibility/end-to-end verification.                                                           |

## Decisions still needed

LLM provider/model and usage budget, permitted initial content sources, and hosting provider. These do not block local UI work or storage/domain foundations.

## Frontend organization

Refactored on 5 November 2026 to follow DESIGN_SYSTEM.md sections 6–7:

- `src/App.jsx`: browser router and shared provider only.
- `src/app/routes.jsx`: explicit screen routes, including missing-page handling.
- `src/pages/`: Discover, Trending, Topics, ContentDetail, Search, Saved, AskAI, Dashboard, ReadingHistory, Preferences.
- `src/components/layout/`: AppShell, Sidebar, Header, MobileNav.
- `src/components/content/`: FeedPage, ContentFeed, ContentCard, ContentTypeTabs, FeedFilters, BookmarkButton, ForYouExplanation.
- `src/components/common/`: reusable EmptyState.
- `src/context/NewsContext.jsx`: shared local state and filters.
- `src/data/preview.js`: illustrative content and navigation; `src/data/taxonomy.js`: shared 14-topic and four-format taxonomy.
- `src/components/preferences/PreferenceOptions.jsx`, `src/hooks/usePreferences.js`, and `src/utils/preferences.js`: preference selection and persistence.
- `src/utils/forYou.js`: local ranking and feed selection; `src/utils/bookmarks.js`: defensive bookmark persistence.
- `src/hooks/useReadingHistory.js` and `src/utils/readingHistory.js`: local history logic.

Verification after refactor: production build and five reading-history tests pass. Browser/visual regression testing remains pending. This is structural work; it does not complete pending backend features.

## Formatting maintenance

Added Prettier configuration, EditorConfig, and root `format` / `format:check` scripts. Formatted supported project files; generated builds, dependencies, lockfile and environment files are excluded. This is maintenance, not completion of additional feature catalogue entries.

## F19 — local preferences implementation

- Dedicated `/preferences` page, entered through Discover's “Personalize your feed” link.
- Shared taxonomy defines all 14 PRD topics and four content formats; preferences persist stable IDs.
- Checkbox changes are local drafts. Cancel leaves saved preferences unchanged. Reset clears the draft and requires Save to apply.
- No selections mean no preference within that group. Preferences do not alter URL filters. F14 now uses them for local preview ranking; server ranking remains pending.
- Successful saves restore on reload through the shared provider; failed writes keep previous preferences and show an error.
- Reusable `PreferenceOptions`, separate `usePreferences` hook, storage utilities, and page follow the component structure.
- Executed `node --test apps/web/src/utils/*.test.js`: PASS, 12 tests (seven preferences, five history). Storage tests use an in-memory storage adapter.
- Executed `npm run build` and `npm run format:check`: PASS.
- Browser verification attempt could not reach the local preview (`ERR_CONNECTION_TIMED_OUT`); browser save/reload/cancel/reset, visual, keyboard, and responsive checks remain pending.

## F14 — ForYou preview ranking

Implemented 5 November 2026 under FEATURES.md F14 and SYSTEM_DESIGN.md section 4.3.

- Discover default sort is now **For You (preview)**. A preferred topic adds two internal ordering points; a preferred format adds one. Unread items win ties; original order breaks remaining ties. These points are not relevance/quality scores and are not displayed as metrics.
- Saved stable topic IDs map to the shared taxonomy's preview labels. Saved format IDs match the item's format. Reading history is read from the existing provider.
- Items are reordered rather than hidden by preferences. Explicit type/topic/text filters still narrow results. Title A–Z overrides personalization. Saved, Search and Trending retain their existing order.
- Empty preferences/history preserve original order. Resetting preferences removes preference boosts; history still influences unread ties. Clearing history removes that tie-break signal.
- Expandable explanation describes actual behavior and the missing live signals. Preference-save messaging reflects connected local ordering.
- `node --test apps/web/src/utils/*.test.js`: PASS, 20 tests (8 ranking/selection, 7 preferences, 5 history).
- `npm run build`: PASS. Prettier applied and formatting check passes.
- This is local preview behavior only. Server-computed relevance/quality/freshness/available engagement and validated recommendation endpoint remain pending. Browser/visual interaction verification remains pending.

Next planned work: backend/database foundation and persistent unified content model (F39), then validation/metadata/deduplication (F2/F5/F3), following the implementation sequence. Full F14 acceptance awaits backend integration.

## Documentation reconciliation — 5 November 2026

Audited source files and current tests against the tracker. Corrected F20 from UI preview to partial because local personalization exists, recorded the defensive bookmark storage implementation/tests, and synchronized feature catalogue status, roadmap, README and verification guidance. No application features were added during this documentation update.

Executed `node --test apps/web/src/utils/*.test.js`: **PASS, 23 tests**, including three existing bookmark tests. Browser/visual/keyboard/mobile checks remain pending; the previous local-preview connection attempt timed out. Unit storage tests use an in-memory adapter and do not establish browser reload acceptance.

## Foundation delivery checklist — F39 and backend/database foundation

The checklist below was the agreed plan. Its database/health scope is now delivered and verified; see the F39 delivery entry for results and the current next step.

Discuss the concrete implementation before building, consistent with the agreed workflow.

1. Add the Express API workspace with configuration, startup, and health/error handling; keep secrets server-side.
2. Add PostgreSQL connection management and versioned migrations following DATABASE_DESIGN.md. Persist publishers, sources, the unified content record, the controlled taxonomy and mappings, ingestion runs, and processing logs as appropriate to the documented foundation.
3. Represent ARTICLE, VIDEO, RESEARCH and DISCUSSION without requiring unavailable optional fields. Keep original URL, canonical URL, source/publisher identity and nullable enrichment/provenance fields distinct.
4. Seed all 14 configured topics; use explicit development fixtures for format verification, clearly separated from ingested data.
5. Verify migration application and documented repeat execution, foreign keys/constraints, and round-trip persistence of all four content types against a test PostgreSQL instance. Verify the API's healthy/unavailable database behavior.
6. Update setup instructions and the tracker with actual executed results. Do not mark F39 complete from a schema file alone.

Then implement F2/F5 metadata validation and normalization, followed by F3 canonical URL/fingerprint deduplication and its repeated-ingestion checks. Live source adapters (F1) follow once initial permitted sources are selected. Complete server ranking, API-backed screens and assistant after their data dependencies exist.

Pending browser verification of completed local features remains a parallel follow-up. Source selection, LLM provider/model/budget, and hosting are still open; none blocks local schema and backend foundation work. Docker delivery (F35) remains pending until its own runtime checks pass.

## F39 — backend/database foundation delivered

Implemented and verified on 5 November 2026:

- Express API workspace with liveness/readiness, request IDs, consistent JSON 404/503/500 responses, safe structured logs, port configuration and graceful shutdown.
- PostgreSQL package with bounded connection/query timeouts, parameterized create/read repository, transactional migrations, advisory locking and checksum tracking.
- Persistent schema for all four formats, publishers, sources, controlled categories/tags/mappings, ingestion runs, processing logs and relations. Original/canonical URLs remain separate. Optional metadata/enrichment fields remain nullable. Canonical uniqueness, ranges, enums, foreign keys, indexes and update timestamps are defined.
- Generated indexed full-text search vector is infrastructure only; no search endpoint is delivered yet.
- Framework-independent shared taxonomy supplies the frontend and the 14-topic SQL seed. No user-state server tables, real sources, AI summaries or publisher claims were added.
- Local PostgreSQL Compose configuration and `.env.example`; no app/worker container packaging yet.

Executed verification:

| Check                       | Result               | Evidence limits                                                                                                   |
| --------------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Frontend logic suite        | PASS: 23             | Existing local feature tests                                                                                      |
| PostgreSQL foundation suite | PASS: 7 test results | Real PostgreSQL 16 isolated container; includes parent integration test and five subtests plus pool config test   |
| API suite                   | PASS: 6              | Five HTTP behavior tests with injected database responses and one readiness test against real migrated PostgreSQL |
| Frontend build              | PASS                 | Shared taxonomy workspace compiles                                                                                |
| Formatting                  | PASS                 | Prettier applied and checked                                                                                      |

Database checks covered initial/repeated migrations, all 14 taxonomy rows, all four formats, nullable optional fields, canonical uniqueness, enum/range/foreign-key enforcement, and generated search-vector updates. API checks covered liveness with unavailable database, safe 503, pending migrations, consistent 404, request IDs and real readiness.

Sandbox loopback access initially produced EACCES; rerunning the HTTP/database checks with approved local access passed. The temporary PostgreSQL verification container uses no persistent volume and is removed after tests. This does not establish full Docker delivery (F35), ingestion validation (F2/F5), automatic URL canonicalization/fingerprint deduplication (F3), or browser/UI integration.

**Next build:** implement F2/F5 as an internal ingestion normalization/validation module using the persistent contract. Preserve original metadata, validate required title/HTTP(S) URL/source identity, allow missing optional fields, normalize timestamps/types, reject invalid candidates with reasons, and test malformed inputs. Then implement F3 canonicalization/fingerprints and repeated-ingestion behavior before connecting live F1 sources.

# NewsDC implementation tracker

Updated: 5 November 2026 (Asia/Calcutta).

Source of scope: [FEATURES.md](FEATURES.md). Specifications describe intended behavior; this file records implementation evidence. Preview data is illustrative and is not evidence of ingestion or AI processing.

## Status definitions

- **Pending:** not implemented.
- **UI preview:** layout exists, but the feature acceptance criteria are not fulfilled.
- **Partial:** some required behavior exists; remaining work is listed.
- **Implemented; browser QA pending:** implementation exists, with remaining browser verification explicitly tracked. This is not full acceptance sign-off.
- **Verified:** all applicable acceptance checks executed successfully. No feature currently has complete browser/end-to-end acceptance evidence.
- **Deferred P2:** excluded from initial MVP implementation sequence.

## Feature inventory

| ID  | Feature                     | Priority    | Status                          | Evidence / remaining work                                                                                                                     |
| --- | --------------------------- | ----------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| F1  | Source ingestion            | P0          | Pending                         | Not implemented.                                                                                                                              |
| F2  | Metadata extraction         | P0          | Pending                         | Not implemented.                                                                                                                              |
| F3  | Duplicate detection         | P0          | Pending                         | Not implemented.                                                                                                                              |
| F4  | Scheduled refresh           | P0          | Pending                         | Not implemented.                                                                                                                              |
| F5  | Content validation          | P0          | Pending                         | Not implemented.                                                                                                                              |
| F6  | Source management           | P1          | Pending                         | Not implemented.                                                                                                                              |
| F7  | Relevance detection         | P0          | Pending                         | Not implemented.                                                                                                                              |
| F8  | Categorization              | P0          | Pending                         | Not implemented.                                                                                                                              |
| F9  | Summarization               | P0          | Pending                         | Not implemented.                                                                                                                              |
| F10 | Insight extraction          | P0          | Pending                         | Not implemented.                                                                                                                              |
| F11 | Quality scoring             | P0          | Pending                         | Not implemented.                                                                                                                              |
| F12 | Content classification      | P0          | Pending                         | Not implemented.                                                                                                                              |
| F13 | Trend detection             | P1          | Pending                         | Not implemented.                                                                                                                              |
| F14 | ForYou                      | P0          | Pending                         | Static preview order; no personalized ranking.                                                                                                |
| F15 | Trending                    | P0          | Pending                         | Not implemented.                                                                                                                              |
| F16 | Topic feed                  | P0          | Partial                         | Topic query filters the five local preview records; no API.                                                                                   |
| F17 | Related content             | P1          | Pending                         | Not implemented.                                                                                                                              |
| F18 | Reading history             | P0          | Implemented; browser QA pending | Local history hook and /history screen; revisits, clear, validation, 200-item limit. Five utility tests pass; browser integration unverified. |
| F19 | Preferences                 | P0          | Pending                         | URL filters exist, but persistent topic/type preferences are not implemented.                                                                 |
| F20 | Home / ForYou               | P0          | UI preview                      | Discover renders local samples; personalization and pagination pending.                                                                       |
| F21 | Trending                    | P0          | UI preview                      | Ranked-looking sample list; no trending endpoint or live ranking.                                                                             |
| F22 | Topics                      | P0          | Partial                         | Eight topic links work over samples; full configured taxonomy and API counts pending.                                                         |
| F23 | Content detail              | P0          | UI preview                      | Local ID lookup, summary panel and score placeholder; verified metadata, original links and related content pending.                          |
| F24 | Search                      | P0          | Partial                         | Substring search over local samples; PostgreSQL full-text search pending.                                                                     |
| F25 | Bookmarks                   | P0          | Implemented; browser QA pending | Save/unsave uses localStorage; Saved view reads saved IDs. Persistence has not been browser-tested.                                           |
| F26 | Dashboard                   | P1          | UI preview                      | Explicit disconnected states; no operational metrics.                                                                                         |
| F27 | Filters and sorting         | P0          | Partial                         | Type/topic/text filters combine; title sort exists. Date/publisher/score filters pending.                                                     |
| F28 | Theme                       | P1          | Implemented; browser QA pending | Theme toggle and localStorage preference exist; contrast/browser checks pending.                                                              |
| F29 | Pagination/infinite loading | P0          | Pending                         | Not implemented.                                                                                                                              |
| F30 | Keyboard shortcuts          | P2          | Deferred P2                     | Future scope.                                                                                                                                 |
| F31 | AI research assistant       | P0          | UI preview                      | Prompt suggestions/composer and disconnected reply only; retrieval and generation pending.                                                    |
| F32 | Source references           | P0          | Pending                         | Not implemented.                                                                                                                              |
| F33 | JSON export                 | P1          | Pending                         | Not implemented.                                                                                                                              |
| F34 | Markdown export             | P1          | Pending                         | Not implemented.                                                                                                                              |
| F35 | Docker deployment           | P0          | Pending                         | Compose file is a placeholder; no runnable containers.                                                                                        |
| F36 | Logging/error handling      | P0          | Pending                         | Not implemented.                                                                                                                              |
| F37 | Documentation               | P0          | Partial                         | Specification docs exist; current README refreshed. Clean setup and deployment unverified.                                                    |
| F38 | AI-assisted development log | P0          | Partial                         | This tracker records implementation and executed checks; ongoing updates required.                                                            |
| F39 | Multi-format content model  | P0          | Partial                         | All four formats represented in preview data; persistent common schema pending.                                                               |
| F40 | Content-type filter         | P0          | Partial                         | Type filtering implemented on local samples; API and browser validation pending.                                                              |
| F41 | Video discovery             | P1          | Pending                         | Not implemented.                                                                                                                              |
| F42 | Video detail                | P1          | Pending                         | Not implemented.                                                                                                                              |
| F43 | Video metadata extraction   | P1          | Pending                         | Not implemented.                                                                                                                              |
| F44 | Research discovery          | P1          | Pending                         | Not implemented.                                                                                                                              |
| F45 | Unified search              | P0          | Partial                         | Local text search covers four preview formats; indexed search and actual publisher/source attribution pending.                                |
| F46 | Operational observability   | Recommended | Pending                         | No run tracking, AI retry logs, or protected manual trigger.                                                                                  |

## Implementation order

Work in individual increments and update this inventory and verification log with each change. P0 comes before optional P1/P2 work.

1. Local reading history (F18): implementation complete; browser QA pending.
2. Persistent topic/type preferences (F19), full topic directory (F22), then ForYou integration (F14).
3. Backend/database foundation, common content schema (F39), validation/metadata (F2/F5), deduplication (F3).
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
- `src/pages/`: Discover, Trending, Topics, ContentDetail, Search, Saved, AskAI, Dashboard, ReadingHistory.
- `src/components/layout/`: AppShell, Sidebar, Header, MobileNav.
- `src/components/content/`: FeedPage, ContentFeed, ContentCard, ContentTypeTabs, FeedFilters, BookmarkButton.
- `src/components/common/`: reusable EmptyState.
- `src/context/NewsContext.jsx`: shared local state and filters.
- `src/data/preview.js`: clearly illustrative content, topic and navigation definitions.
- `src/hooks/useReadingHistory.js` and `src/utils/readingHistory.js`: local history logic.

Verification after refactor: production build and five reading-history tests pass. Browser/visual regression testing remains pending. This is structural work; it does not complete pending backend features.

## Formatting maintenance

Added Prettier configuration, EditorConfig, and root `format` / `format:check` scripts. Formatted supported project files; generated builds, dependencies, lockfile and environment files are excluded. This is maintenance, not completion of additional feature catalogue entries.

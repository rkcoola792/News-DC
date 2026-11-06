# NewsDC requirements in implementation order

Created: 5 November 2026 (Asia/Calcutta).

Latest increment, 6 November: user-selected automatic arXiv research ingestion is delivered (F1/F2/F44); 50 real papers, repeat deduplication and research search verified. F2 tags are complete. Next: finish non-AI reliability/acceptance, then agree on the low-cost AI scope/model and spending cap before any paid calls. See IMPLEMENTATION_STATUS.md and RESEARCH_INGESTION.md; historical stage notes below are not current completion evidence.

## Purpose and source of truth

This document presents the requirements in the order we plan to build them, including dependencies, current progress, and acceptance criteria. It is an implementation sequence, not a dated history or a promise that each stage is complete. Stage numbers describe order rather than deadlines.

- [FEATURES.md](FEATURES.md): feature IDs, priorities, and acceptance criteria.
- [PRD.md](PRD.md) and [MVP_SCOPE.md](MVP_SCOPE.md): product requirements, taxonomy, priorities, exclusions.
- [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md): authoritative current status and executed verification evidence.
- [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) and [UI_UX_SPEC.md](UI_UX_SPEC.md): approved design direction and component contracts, using the supplied nine-screen screenshot as visual reference.
- [SYSTEM_DESIGN.md](SYSTEM_DESIGN.md), [DATABASE_DESIGN.md](DATABASE_DESIGN.md), [API_SPEC.md](API_SPEC.md), and [AI_WORKFLOW.md](AI_WORKFLOW.md): implementation contracts.
- [TESTING_AND_ACCEPTANCE.md](TESTING_AND_ACCEPTANCE.md) and [DEPLOYMENT.md](DEPLOYMENT.md): verification and delivery.

The existing scope remains unchanged: P0 is essential, P1 is optional when time permits, and P2 is future work. Backend dependencies must exist before API-backed features can be accepted, even when their UI previews already exist.

## Current position and immediate next step

Updated 6 November 2026. Non-AI APIs and UI are connected to real data; this supersedes earlier stage snapshots below. Local Docker and runtime smoke checks pass, with 91 actual records. Last full automated run: 52 passing test results. F2 tags are now implemented. Remaining final-product gaps include AI enrichment/assistant (deferred), recommendation/detail AI integration, dataset coverage and public delivery.

**Next proposed step:** non-AI acceptance and scheduled-ingestion reliability checks. F2 tags are completed; see F2_TAGS.md. Any AI work remains subject to explicit approval.

## Sequence at a glance

| Order | Stage                                         | Main dependency                                                 |
| ----- | --------------------------------------------- | --------------------------------------------------------------- |
| 01    | Foundation and shared UI                      | Approved documentation and visual reference                     |
| 02    | Local user features and topic directory       | Shared UI                                                       |
| 03    | Backend, database, and content contracts      | Documented schema/API contracts                                 |
| 04    | Ingestion, refresh, and operational safety    | Database, normalization, permitted sources                      |
| 05    | AI enrichment                                 | Ingested content, provider/model/budget decisions               |
| 06    | Content APIs, search, filters, and pagination | Database and content contracts; enriched output where displayed |
| 07    | Personalized Discover and Trending            | Preferences/history, content APIs, stored ranking signals       |
| 08    | Grounded research assistant                   | Indexed content, retrieval, configured AI provider              |
| 09    | MVP verification and delivery                 | Working P0 flows                                                |
| 10    | Optional enhancements after the core works    | Functional core; available time                                 |
| 11    | Future scope                                  | Accepted MVP and future prioritization                          |

## 01. Foundation and shared UI

Use the approved React/Vite and Express/PostgreSQL modular-monolith stack. Keep separate pages, reusable components, explicit routes, design tokens, and consistent Prettier formatting. Maintain documentation and verification evidence throughout all subsequent stages.

**Current position:** The current UI foundation and page/component separation exist. Build and history logic tests pass; visual, keyboard, mobile, and clean-setup verification remain pending.

| ID  | Requirement                 | Priority | Acceptance criteria                                  |
| --- | --------------------------- | -------- | ---------------------------------------------------- |
| F37 | Documentation               | P0       | New developer can follow setup and understand system |
| F38 | AI-assisted development log | P0       | Change/verification log maintained                   |

## 02. Local user features and topic directory

Finish local reading history and bookmarks, persist selected topics/content types, and expose the complete PRD taxonomy. Keep all MVP user state in this browser without registration.

**Current position:** History and bookmark implementations exist, with browser QA pending. Preferences are implemented with browser QA pending. All 14 topic links now exist; live feeds remain pending.

| ID  | Requirement     | Priority | Acceptance criteria                   |
| --- | --------------- | -------- | ------------------------------------- |
| F18 | Reading history | P0       | History can be viewed/cleared locally |
| F19 | Preferences     | P0       | Preferences persist after reload      |
| F25 | Bookmarks       | P0       | Local bookmark list persists          |
| F22 | Topics          | P0       | Each configured topic opens a feed    |

## 03. Backend, database, and content contracts

Create Express modules and PostgreSQL migrations. Define one content model for all four types. Validate required fields, tolerate missing optional metadata, preserve source attribution, canonicalize URLs conservatively, and enforce uniqueness. Implement fingerprint checks.

**Current position:** Express health/startup and PostgreSQL migrations/repository are implemented. All four content types round-trip in real PostgreSQL tests. F39 foundation is verified; candidate normalization/validation (F2/F5) and automatic deduplication (F3) remain next.

| ID  | Requirement                | Priority | Acceptance criteria                                            |
| --- | -------------------------- | -------- | -------------------------------------------------------------- |
| F39 | Multi-format content model | P0       | All content types fit common schema                            |
| F2  | Metadata extraction        | P0       | Missing optional fields are allowed; required fields validated |
| F5  | Content validation         | P0       | Invalid records rejected or quarantined with reason            |
| F3  | Duplicate detection        | P0       | Same canonical URL cannot create two records                   |

## 04. Ingestion, refresh, and operational safety

Choose permitted initial sources before connecting adapters. Target one public API and one RSS source where access permits. Record run status, counts, and failures. Protect manual ingestion server-side. Isolate source failures and make retries bounded and idempotent.

**Current position:** Pending. Sources are not selected or connected; no scheduling or operational API exists.

| ID  | Requirement               | Priority    | Acceptance criteria                                                                                          |
| --- | ------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------ |
| F1  | Source ingestion          | P0          | Adapter returns normalized candidate records; errors logged                                                  |
| F4  | Scheduled refresh         | P0          | Schedule invokes ingestion and records run status                                                            |
| F36 | Logging/error handling    | P0          | Source and AI failures are observable                                                                        |
| F46 | Operational observability | Recommended | Ingestion/AI status, counts, errors and retry history are inspectable; manual trigger protected server-side. |

## 05. AI enrichment

After provider/model and budget decisions, process available permitted text. Store relevance, controlled categories and classification, factual summaries, structured insights, and explained scores. Validate output and retain model/prompt provenance and processing failures. Do not fabricate transcript-dependent claims.

**Current position:** Pending. Current summary panels are illustrative UI, not generated results.

| ID  | Requirement            | Priority | Acceptance criteria                         |
| --- | ---------------------- | -------- | ------------------------------------------- |
| F7  | Relevance detection    | P0       | Store relevant flag, confidence and reason  |
| F8  | Categorization         | P0       | Categories are from configured taxonomy     |
| F12 | Content classification | P0       | Classification stored as a controlled label |
| F9  | Summarization          | P0       | Summary stored and marked AI-generated      |
| F10 | Insight extraction     | P0       | Structured list stored and displayed        |
| F11 | Quality scoring        | P0       | Score stored with documented rubric         |

## 06. Content APIs, search, filters, and pagination

Implement the documented list/detail/topic/search contracts with parameterized PostgreSQL queries. Support combined type/topic/publisher/date/score filters and supported sorts. Connect detail metadata and original source links. Add bounded pagination and loading, empty, and error states.

**Current position:** Local sample filtering, substring search, and detail lookup exist. Database-backed search, real metadata/source links, full filtering, pagination, and API integration remain pending.

| ID  | Requirement                 | Priority | Acceptance criteria                         |
| --- | --------------------------- | -------- | ------------------------------------------- |
| F16 | Topic feed                  | P0       | Topic page filters correctly                |
| F23 | Content detail              | P0       | Detail loads by ID; source opens externally |
| F24 | Search                      | P0       | Search query and filters work               |
| F45 | Unified search              | P0       | Results include content type and source     |
| F27 | Filters and sorting         | P0       | Filters combine predictably                 |
| F40 | Content-type filter         | P0       | Each type filter returns expected items     |
| F29 | Pagination/infinite loading | P0       | No duplicate items between pages            |

## 07. Personalized Discover and Trending

Use stored relevance, quality, freshness, and available engagement signals for deterministic ranking. Pass validated local preferences to the API; document missing-signal behavior. Integrate history and preferences with ForYou and connect Trending to its endpoint.

**Current position:** Discover now has local preference/history-based preview ranking. Trending and live recommendation endpoints remain pending. Requires persistent preferences and real content/signals from earlier stages.

| ID  | Requirement   | Priority | Acceptance criteria                        |
| --- | ------------- | -------- | ------------------------------------------ |
| F14 | ForYou        | P0       | Feed order changes when preferences change |
| F15 | Trending      | P0       | Ranking uses documented signals            |
| F20 | Home / ForYou | P0       | Paginated feed renders                     |
| F21 | Trending      | P0       | Trending endpoint powers view              |

## 08. Grounded research assistant

Retrieve a bounded set of matching indexed records, generate answers from that evidence only, validate cited IDs against retrieved items, and expose linked sources. Return insufficient evidence when retrieval is weak. Bound requests and keep provider secrets server-side.

**Current position:** Composer and suggestions exist. Retrieval, AI answers, citation validation, and actual source references remain pending.

| ID  | Requirement           | Priority | Acceptance criteria                                   |
| --- | --------------------- | -------- | ----------------------------------------------------- |
| F31 | AI research assistant | P0       | Answer is grounded in retrieved records               |
| F32 | Source references     | P0       | Each citation maps to a returned content item and URL |

## 09. MVP verification and delivery

Complete meaningful unit/integration/browser checks, responsive and accessibility checks, and failure-path verification. Package client/API/worker/database as appropriate with Docker. Verify fresh setup, protected operations, environment configuration, persistence, and the deployed demo. Keep F37/F38 documentation and evidence updated.

**Current position:** Pending. Local PostgreSQL Compose exists; full application Docker packaging remains pending. Production frontend compilation and 23 local logic tests have passed; deployment and end-to-end acceptance have not.

| ID  | Requirement       | Priority | Acceptance criteria                      |
| --- | ----------------- | -------- | ---------------------------------------- |
| F35 | Docker deployment | P0       | Documented containers start successfully |

## 10. Optional enhancements after the core works

Implement P1 additions if time permits: source controls, emerging trends with evidence, improved related ranking, real dashboard metrics, theme verification, exports, and richer video/research support. Reuse the existing model and UI components.

**Current position:** Theme implementation exists with browser/contrast QA pending. Dashboard is a disconnected preview. Other optional features are pending.

| ID  | Requirement               | Priority | Acceptance criteria                                         |
| --- | ------------------------- | -------- | ----------------------------------------------------------- |
| F6  | Source management         | P1       | Operator can inspect source/job state                       |
| F13 | Trend detection           | P1       | Trend output links to supporting items                      |
| F17 | Related content           | P1       | Results share topic/tags or similarity signal               |
| F26 | Dashboard                 | P1       | Counts match API/database values                            |
| F28 | Theme                     | P1       | Theme preference persists                                   |
| F33 | JSON export               | P1       | Valid downloadable JSON                                     |
| F34 | Markdown export           | P1       | Readable Markdown with source URLs                          |
| F41 | Video discovery           | P1       | Video appears with channel, duration/thumbnail if available |
| F42 | Video detail              | P1       | External playback link works                                |
| F43 | Video metadata extraction | P1       | No fabricated transcript/content fields                     |
| F44 | Research discovery        | P1       | Research items are searchable                               |

## 11. Future scope

Defer keyboard shortcuts and the P2 roadmap until the MVP is accepted. Other future items include vector search, accounts/cross-device sync, notifications, multilingual content, and permitted transcript indexing.

**Current position:** Deferred. No P2 commitment is added by this document.

| ID  | Requirement        | Priority | Acceptance criteria                                       |
| --- | ------------------ | -------- | --------------------------------------------------------- |
| F30 | Keyboard shortcuts | P2       | Shortcuts documented and do not conflict with text inputs |

## Scope details that apply across stages

- No login/registration or cross-device user sync in the MVP.
- No full third-party article/video hosting, access-control bypass, or claims that AI watched a video without supplied reliable text.
- Display AI-generated material clearly and preserve publisher attribution and safe external source links.
- Keep feed summaries brief; reveal score explanations and insights in detail views.
- Support keyboard navigation, visible focus, reduced motion, mobile layouts, and readable contrast.
- Maintain loading, empty, and recoverable error states as each API-backed screen is connected.
- The dataset goal is 500 relevant records where source access permits; report actual counts and limitations.
- F17 is P1 improved related ranking; baseline shared-category related links remain part of the planned content detail scope in MVP_SCOPE.md.
- Theme and dashboard previews already exist; that does not promote optional P1 expansion ahead of core P0 work.

## How we will track each increment

1. Select the next requirement from the current stage and read its referenced contracts.
2. Implement one reviewable increment with separate pages/components and formatted source.
3. Run the checks relevant to its behavior. Use `npm run format:check` and the production build for frontend changes.
4. Update the feature tracker with changes, executed checks, and outstanding verification. A passing build alone does not prove a feature works end to end.
5. Report what was implemented, what passed, and what remains before moving to the next increment.

**Next planned step:** non-AI acceptance/reliability checks; F2 tag implementation and tests are complete.

## Open decisions and when they are needed

| Decision                                | Needed before                                                    | Work that can continue meanwhile                                      |
| --------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------- |
| Exact initial permitted API/RSS sources | Connecting live ingestion in stage 04                            | Local UI, schema, validation, deduplication, adapter contracts        |
| LLM provider/model and usage budget     | Provider-backed processing in stage 05 and assistant in stage 08 | Processing contracts, output validation, retrieval and failure states |
| Hosting provider                        | Production release in stage 09                                   | Local Docker packaging, tests and setup documentation                 |

## Foundation progress update — 5 November 2026

Stage 03 now has Express health/startup, PostgreSQL pool and schema migrations, shared taxonomy, and internal four-format create/read persistence. Real PostgreSQL verification passed (7 database test results and 6 API tests), alongside 23 frontend logic tests and production build. Stage 03 metadata normalization/validation and deduplication remain next. Earlier descriptions of pending foundation work are superseded by this update and the implementation tracker.

## F2 completion update — 6 November 2026

The source/import tag gap is now closed end to end; see F2_TAGS.md and the tracker. Earlier F2-next descriptions are superseded. Next is the non-AI acceptance/reliability pass, followed by a separate decision about starting deferred AI work.

## Next stage update — 6 November 2026

The focused non-AI reliability pass is complete: safe scheduled failure/recovery, an actual one-minute timer, isolated database outage/reconnect, and keyboard/mobile research flows verified. AI demo planning is approved with a $1 initial ceiling; the subsequent user preference is Gemini free tier, $0 target and no paid fallback. Next: confirm a billing-disabled project/model/quota and configure the server-side key, implement guarded enrichment for a small batch, then the grounded assistant. See AI_DEMO_PLAN.md; no live AI calls have run.

## Provider routing increment — 6 November 2026

Gemini primary, two temporary-failure retries, then OpenAI fallback are implemented and live-verified. Application spending/daily caps were removed at user request. Usage persists through Prisma. Next: F7–F12 enrichment through this gateway, then F31/F32 cited assistant. See AI_PROVIDER_ROUTING.md. Historical cap/deferral decisions above are superseded.

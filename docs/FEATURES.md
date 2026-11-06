# Feature Catalogue — NewsDC

Priorities: **P0** = MVP essential; **P1** = important if time permits; **P2** = future/optional. These priorities are proposed implementation priorities, not priorities stated by the assignment.

Current status: non-AI build delivered for local testing on 5 November 2026. Application queries use Prisma. AI enrichment/assistant work is deferred by explicit user instruction. See [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) for evidence and limitations and [NON_AI_HANDOFF.md](NON_AI_HANDOFF.md) to test. Current automated suite: 52 passing results; current actual dataset: 91 records. Priorities/acceptance criteria remain the final product target.

## A. Ingestion and content management

| ID  | Feature             | Description                                                                                   | Priority | Acceptance criteria                                            | Current status             |
| --- | ------------------- | --------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------- | -------------------------- |
| F1  | Source ingestion    | Fetch from public APIs/RSS                                                                    | P0       | Adapter returns normalized candidate records; errors logged    | Implemented; live verified |
| F2  | Metadata extraction | Capture title, description, URL, publisher, date, author, tags and engagement where available | P0       | Missing optional fields are allowed; required fields validated | Implemented; tested        |
| F3  | Duplicate detection | Canonical URL and fingerprint detection                                                       | P0       | Same canonical URL cannot create two records                   | Implemented; tested        |
| F4  | Scheduled refresh   | Periodic ingestion                                                                            | P0       | Schedule invokes ingestion and records run status              | Implemented; opt-in        |
| F5  | Content validation  | Validate and normalize external records                                                       | P0       | Invalid records rejected or quarantined with reason            | Implemented; tested        |
| F6  | Source management   | Enable/disable sources and inspect last run                                                   | P1       | Operator can inspect source/job state                          | Implemented; tested        |

## B. AI intelligence

| ID  | Feature                | Description                                                               | Priority | Acceptance criteria                         | Current status    |
| --- | ---------------------- | ------------------------------------------------------------------------- | -------- | ------------------------------------------- | ----------------- |
| F7  | Relevance detection    | Decide whether item materially relates to Data Centers                    | P0       | Store relevant flag, confidence and reason  | Deferred AI phase |
| F8  | Categorization         | Assign configurable topic labels                                          | P0       | Categories are from configured taxonomy     | Deferred AI phase |
| F9  | Summarization          | Generate concise factual summary                                          | P0       | Summary stored and marked AI-generated      | Deferred AI phase |
| F10 | Insight extraction     | Extract technical/business insights                                       | P0       | Structured list stored and displayed        | Deferred AI phase |
| F11 | Quality scoring        | Estimate usefulness/quality                                               | P0       | Score stored with documented rubric         | Deferred AI phase |
| F12 | Content classification | Distinguish news, research, investment intelligence and engineering ideas | P0       | Classification stored as a controlled label | Deferred AI phase |
| F13 | Trend detection        | Identify rising themes over time                                          | P1       | Trend output links to supporting items      | Deferred AI phase |

## C. Recommendation and personalization

| ID  | Feature         | Description                                             | Priority | Acceptance criteria                           | Current status               |
| --- | --------------- | ------------------------------------------------------- | -------- | --------------------------------------------- | ---------------------------- |
| F14 | ForYou          | Rank items against local topic preferences and activity | P0       | Feed order changes when preferences change    | Implemented; non-AI          |
| F15 | Trending        | Rank timely/high-signal content                         | P0       | Ranking uses documented signals               | Implemented; non-AI          |
| F16 | Topic feed      | List items by topic                                     | P0       | Topic page filters correctly                  | Implemented; tested          |
| F17 | Related content | Show related items                                      | P1       | Results share topic/tags or similarity signal | Implemented; tested          |
| F18 | Reading history | Record opened items locally                             | P0       | History can be viewed/cleared locally         | Implemented; smoke checked   |
| F19 | Preferences     | Store selected topics and content types locally         | P0       | Preferences persist after reload              | Implemented; browser checked |

## D. User interface

| ID  | Feature                     | Description                                           | Priority | Acceptance criteria                                       | Current status               |
| --- | --------------------------- | ----------------------------------------------------- | -------- | --------------------------------------------------------- | ---------------------------- |
| F20 | Home / ForYou               | Personalized feed                                     | P0       | Paginated feed renders                                    | Implemented; connected       |
| F21 | Trending                    | Trending feed                                         | P0       | Trending endpoint powers view                             | Implemented; connected       |
| F22 | Topics                      | Topic directory and feeds                             | P0       | Each configured topic opens a feed                        | Implemented; connected       |
| F23 | Content detail              | Summary, insights, metadata, source and related links | P0       | Detail loads by ID; source opens externally               | Implemented; non-AI          |
| F24 | Search                      | Full-text search                                      | P0       | Search query and filters work                             | Implemented; tested          |
| F25 | Bookmarks                   | Save/unsave content                                   | P0       | Local bookmark list persists                              | Implemented; browser checked |
| F26 | Dashboard                   | Ingestion and content metrics                         | P1       | Counts match API/database values                          | Implemented; browser checked |
| F27 | Filters and sorting         | Date, type, topic, publisher and score                | P0       | Filters combine predictably                               | Implemented; tested          |
| F28 | Theme                       | Dark/light mode                                       | P1       | Theme preference persists                                 | Implemented; smoke checked   |
| F29 | Pagination/infinite loading | Fetch additional feed results                         | P0       | No duplicate items between pages                          | Implemented; tested          |
| F30 | Keyboard shortcuts          | Navigate common actions                               | P2       | Shortcuts documented and do not conflict with text inputs | Deferred P2                  |

## E. Assistant, export and delivery

| ID  | Feature                     | Description                                        | Priority | Acceptance criteria                                         | Current status                     |
| --- | --------------------------- | -------------------------------------------------- | -------- | ----------------------------------------------------------- | ---------------------------------- |
| F31 | AI research assistant       | Answer questions using collected content           | P0       | Answer is grounded in retrieved records                     | Deferred AI phase                  |
| F32 | Source references           | Cite supporting content in answer                  | P0       | Each citation maps to a returned content item and URL       | Deferred AI phase                  |
| F33 | JSON export                 | Export records or filtered result set              | P1       | Valid downloadable JSON                                     | Implemented; tested                |
| F34 | Markdown export             | Export selected content/research notes             | P1       | Readable Markdown with source URLs                          | Implemented; tested                |
| F35 | Docker deployment           | Containerized runtime                              | P0       | Documented containers start successfully                    | Implemented; local Docker verified |
| F36 | Logging/error handling      | Structured logs and consistent errors              | P0       | Source and AI failures are observable                       | Implemented; non-AI                |
| F37 | Documentation               | README, architecture, API and setup notes          | P0       | New developer can follow setup and understand system        | Maintained                         |
| F38 | AI-assisted development log | Record agent tasks and manual verification         | P0       | Change/verification log maintained                          | Maintained                         |
| F39 | Multi-format content model  | Common model for article/video/research/discussion | P0       | All content types fit common schema                         | Verified foundation                |
| F40 | Content-type filter         | Filter feeds by content type                       | P0       | Each type filter returns expected items                     | Implemented; tested                |
| F41 | Video discovery             | Ingest and recommend video metadata                | P1       | Video appears with channel, duration/thumbnail if available | Implemented; metadata import       |
| F42 | Video detail                | Show metadata and link to original player          | P1       | External playback link works                                | Implemented; metadata only         |
| F43 | Video metadata extraction   | Extract public metadata from permitted source      | P1       | No fabricated transcript/content fields                     | Implemented; metadata only         |
| F44 | Research discovery          | Support research metadata and source links         | P1       | Research items are searchable                               | Implemented; metadata import       |
| F45 | Unified search              | Search across all content types                    | P0       | Results include content type and source                     | Implemented; tested                |

## F46 — Operational observability (recommended)

Current status: **Implemented for ingestion/operations**. Persistent run tracking and protected controls are available; AI job processing remains deferred.

- Record ingestion run start/end, source, counts, status and error summary.
- Record AI processing status and retry count per content item.
- Provide a basic admin-only/manual trigger protected by a server-side secret or deployment-level access control.
- Do not expose unrestricted ingestion controls to anonymous public users.

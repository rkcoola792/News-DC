# Feature Catalogue — NewsDC

Priorities: **P0** = MVP essential; **P1** = important if time permits; **P2** = future/optional. These priorities are proposed implementation priorities, not priorities stated by the assignment.

## A. Ingestion and content management

| ID  | Feature             | Description                                                                                   | Priority | Acceptance criteria                                            |
| --- | ------------------- | --------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------- |
| F1  | Source ingestion    | Fetch from public APIs/RSS                                                                    | P0       | Adapter returns normalized candidate records; errors logged    |
| F2  | Metadata extraction | Capture title, description, URL, publisher, date, author, tags and engagement where available | P0       | Missing optional fields are allowed; required fields validated |
| F3  | Duplicate detection | Canonical URL and fingerprint detection                                                       | P0       | Same canonical URL cannot create two records                   |
| F4  | Scheduled refresh   | Periodic ingestion                                                                            | P0       | Schedule invokes ingestion and records run status              |
| F5  | Content validation  | Validate and normalize external records                                                       | P0       | Invalid records rejected or quarantined with reason            |
| F6  | Source management   | Enable/disable sources and inspect last run                                                   | P1       | Operator can inspect source/job state                          |

## B. AI intelligence

| ID  | Feature                | Description                                                               | Priority | Acceptance criteria                         |
| --- | ---------------------- | ------------------------------------------------------------------------- | -------- | ------------------------------------------- |
| F7  | Relevance detection    | Decide whether item materially relates to Data Centers                    | P0       | Store relevant flag, confidence and reason  |
| F8  | Categorization         | Assign configurable topic labels                                          | P0       | Categories are from configured taxonomy     |
| F9  | Summarization          | Generate concise factual summary                                          | P0       | Summary stored and marked AI-generated      |
| F10 | Insight extraction     | Extract technical/business insights                                       | P0       | Structured list stored and displayed        |
| F11 | Quality scoring        | Estimate usefulness/quality                                               | P0       | Score stored with documented rubric         |
| F12 | Content classification | Distinguish news, research, investment intelligence and engineering ideas | P0       | Classification stored as a controlled label |
| F13 | Trend detection        | Identify rising themes over time                                          | P1       | Trend output links to supporting items      |

## C. Recommendation and personalization

| ID  | Feature         | Description                                             | Priority | Acceptance criteria                           |
| --- | --------------- | ------------------------------------------------------- | -------- | --------------------------------------------- |
| F14 | ForYou          | Rank items against local topic preferences and activity | P0       | Feed order changes when preferences change    |
| F15 | Trending        | Rank timely/high-signal content                         | P0       | Ranking uses documented signals               |
| F16 | Topic feed      | List items by topic                                     | P0       | Topic page filters correctly                  |
| F17 | Related content | Show related items                                      | P1       | Results share topic/tags or similarity signal |
| F18 | Reading history | Record opened items locally                             | P0       | History can be viewed/cleared locally         |
| F19 | Preferences     | Store selected topics and content types locally         | P0       | Preferences persist after reload              |

## D. User interface

| ID  | Feature                     | Description                                           | Priority | Acceptance criteria                                       |
| --- | --------------------------- | ----------------------------------------------------- | -------- | --------------------------------------------------------- |
| F20 | Home / ForYou               | Personalized feed                                     | P0       | Paginated feed renders                                    |
| F21 | Trending                    | Trending feed                                         | P0       | Trending endpoint powers view                             |
| F22 | Topics                      | Topic directory and feeds                             | P0       | Each configured topic opens a feed                        |
| F23 | Content detail              | Summary, insights, metadata, source and related links | P0       | Detail loads by ID; source opens externally               |
| F24 | Search                      | Full-text search                                      | P0       | Search query and filters work                             |
| F25 | Bookmarks                   | Save/unsave content                                   | P0       | Local bookmark list persists                              |
| F26 | Dashboard                   | Ingestion and content metrics                         | P1       | Counts match API/database values                          |
| F27 | Filters and sorting         | Date, type, topic, publisher and score                | P0       | Filters combine predictably                               |
| F28 | Theme                       | Dark/light mode                                       | P1       | Theme preference persists                                 |
| F29 | Pagination/infinite loading | Fetch additional feed results                         | P0       | No duplicate items between pages                          |
| F30 | Keyboard shortcuts          | Navigate common actions                               | P2       | Shortcuts documented and do not conflict with text inputs |

## E. Assistant, export and delivery

| ID  | Feature                     | Description                                        | Priority | Acceptance criteria                                         |
| --- | --------------------------- | -------------------------------------------------- | -------- | ----------------------------------------------------------- |
| F31 | AI research assistant       | Answer questions using collected content           | P0       | Answer is grounded in retrieved records                     |
| F32 | Source references           | Cite supporting content in answer                  | P0       | Each citation maps to a returned content item and URL       |
| F33 | JSON export                 | Export records or filtered result set              | P1       | Valid downloadable JSON                                     |
| F34 | Markdown export             | Export selected content/research notes             | P1       | Readable Markdown with source URLs                          |
| F35 | Docker deployment           | Containerized runtime                              | P0       | Documented containers start successfully                    |
| F36 | Logging/error handling      | Structured logs and consistent errors              | P0       | Source and AI failures are observable                       |
| F37 | Documentation               | README, architecture, API and setup notes          | P0       | New developer can follow setup and understand system        |
| F38 | AI-assisted development log | Record agent tasks and manual verification         | P0       | Change/verification log maintained                          |
| F39 | Multi-format content model  | Common model for article/video/research/discussion | P0       | All content types fit common schema                         |
| F40 | Content-type filter         | Filter feeds by content type                       | P0       | Each type filter returns expected items                     |
| F41 | Video discovery             | Ingest and recommend video metadata                | P1       | Video appears with channel, duration/thumbnail if available |
| F42 | Video detail                | Show metadata and link to original player          | P1       | External playback link works                                |
| F43 | Video metadata extraction   | Extract public metadata from permitted source      | P1       | No fabricated transcript/content fields                     |
| F44 | Research discovery          | Support research metadata and source links         | P1       | Research items are searchable                               |
| F45 | Unified search              | Search across all content types                    | P0       | Results include content type and source                     |

## F46 — Operational observability (recommended)

- Record ingestion run start/end, source, counts, status and error summary.
- Record AI processing status and retry count per content item.
- Provide a basic admin-only/manual trigger protected by a server-side secret or deployment-level access control.
- Do not expose unrestricted ingestion controls to anonymous public users.

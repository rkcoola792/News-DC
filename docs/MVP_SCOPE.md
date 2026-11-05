# MVP Scope and Prioritization

## Product principle

Deliver a complete, demonstrable vertical slice before adding breadth. The assignment explicitly values a functional end-to-end product and sound engineering decisions over a large feature count.

## P0 — Required for the demo

| Capability        | MVP behavior                                                      | Demo proof                                |
| ----------------- | ----------------------------------------------------------------- | ----------------------------------------- |
| Source ingestion  | At least one public API source and one RSS source, where possible | Trigger job and show ingested count       |
| Normalization     | Map source metadata to common schema                              | Inspect content record                    |
| Deduplication     | Canonical URL unique constraint plus fingerprint check            | Re-ingest same item; count remains stable |
| Relevance filter  | Mark relevant/irrelevant; retain processing status                | Show irrelevant item excluded from feed   |
| Categorization    | Assign one or more configured topics                              | Filter by topic                           |
| AI summary        | Generate concise summary for supported text                       | Open content detail                       |
| Insights          | Extract key technical/business points                             | Show insight list                         |
| Scores            | Store relevance and quality scores                                | Display scores and explain their meaning  |
| ForYou            | Basic local-preference ranking                                    | Select topics and compare feed            |
| Trending          | Freshness + available engagement + quality ranking                | Open Trending                             |
| Search            | PostgreSQL full-text search and filters                           | Search a phrase and filter                |
| Content detail    | Metadata, AI output, related items and original link              | Open an item                              |
| Bookmarks/history | Local storage                                                     | Save and revisit item                     |
| Assistant         | Retrieval over stored content with source references              | Ask a question and open cited links       |
| Operations        | Logs, validation, error handling                                  | Show failed/successful ingestion status   |
| Deployment/docs   | Docker and README                                                 | Run/deploy walkthrough                    |

## P1 — Implement if time allows

- More RSS/API sources.
- Related content ranking beyond shared category.
- Dashboard charts and source-level ingestion metrics.
- JSON and Markdown export.
- Video metadata ingestion and video detail presentation.
- Research DOI/author metadata enrichment.
- Basic emerging trend summaries.
- BullMQ + Redis if scheduler/worker complexity requires it.

## P2 — Future enhancements

- Video transcript extraction and transcript indexing where permitted.
- Semantic search/vector database.
- Advanced user profiles and cross-device sync.
- Feedback-based recommendation learning.
- Notifications and saved searches.
- Multi-language content.
- Advanced admin console and source health monitoring.

## Explicit exclusions

- No registration/login for MVP.
- No content hosting or re-publishing full third-party articles/videos.
- No scraping behind authentication, paywalls or access controls.
- No claim that an LLM has watched a video unless a transcript or other reliable content representation was processed.
- No microservices split for the initial timebox.

## 3–4 day suggested sequence

### Day 1 — Foundation and ingestion

- Create React/Vite and Express projects.
- Set up PostgreSQL and migrations.
- Create content/source/topic schema.
- Implement API/RSS source adapters.
- Normalize and deduplicate records.
- Seed or ingest a small demonstrable dataset.

### Day 2 — AI enrichment and APIs

- Add relevance classification and topic classification.
- Add summary and insight generation.
- Add score calculation and structured-output validation.
- Implement content/search/topic/recommendation endpoints.
- Add job logs and retry handling.

### Day 3 — Frontend and assistant

- Build ForYou, Trending, Topics, Search and detail.
- Add local bookmarks/preferences/history.
- Implement retrieval-based assistant with source links.
- Add responsive states, loading, empty and error states.

### Day 4 — Verification and delivery

- Add exports and dashboard if time permits.
- Test duplicate prevention, AI failures and source citations.
- Dockerize and deploy.
- Verify setup from README.
- Prepare architecture walkthrough, demo script and limitations.

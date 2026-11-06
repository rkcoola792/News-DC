# Product Requirements Document (PRD) — NewsDC

## 1. Document control

| Field              | Value                                    |
| ------------------ | ---------------------------------------- |
| Product            | NewsDC                                   |
| Version            | 0.1                                      |
| Status             | Draft baseline for assignment MVP        |
| Assignment timebox | 3–4 working days                         |
| Product type       | AI-powered Data Center content discovery |

## 2. Product summary

NewsDC discovers, filters, categorizes, summarizes and recommends Data Center-related information across articles, videos, research publications and technical discussions. It brings fragmented industry information into one searchable, recommendation-driven interface and provides an AI assistant that answers questions using collected content with supporting source links.

## 3. Problem statement

Information about Data Center infrastructure, AI compute, GPUs, power, cooling, sustainability, hyperscaler investment, economics, networking, security and regulation is distributed across many publishers and formats. Users must manually discover sources, assess relevance and quality, compare information, and identify useful technical or business insights. This leads to information overload and missed developments.

## 4. Product vision

Become a focused intelligence discovery layer for the Data Center ecosystem: one place to find high-value industry information and understand why it matters.

## 5. Goals

1. Automatically discover publicly accessible content from permitted sources.
2. Reduce noise by detecting irrelevant, duplicate and low-value items.
3. Organize relevant content by configurable topics and content types.
4. Generate concise summaries, insights and transparent relevance/quality indicators.
5. Recommend timely and topic-relevant material.
6. Answer natural-language questions using collected content and source references.
7. Demonstrate a modular, deployable end-to-end MVP.

## 6. Non-goals for the assignment MVP

- Becoming a full content publisher or hosting complete third-party videos/articles.
- User registration, billing, subscriptions or social profiles.
- Building a general-purpose web search engine.
- Guaranteeing exhaustive coverage of the Data Center industry.
- Summarizing video content without accessible transcript or other reliable text.
- Building a production-scale distributed microservice architecture.
- Scraping paywalled or access-controlled material.

## 7. Target users and needs

| User type                     | Need                                                                       |
| ----------------------------- | -------------------------------------------------------------------------- |
| Data Center engineer/operator | Find relevant infrastructure, cooling, power and optimization developments |
| AI infrastructure engineer    | Track GPUs, AI compute, networking and utilization                         |
| Researcher                    | Discover papers, technical blogs and discussions                           |
| Strategy/investment analyst   | Follow hyperscaler investment, economics and market developments           |
| Industry enthusiast           | Understand important news without checking many sources                    |

## 8. Product scope

### Content types

- Article
- Video
- Research
- Discussion

### Configurable topic taxonomy

- Data Center Infrastructure
- AI Compute and GPUs
- Power and Energy
- Cooling
- Sustainability (PUE/WUE/carbon)
- Hyperscaler Investments
- Economics and Financial Models
- Site Selection
- Networking
- Optimization
- AI/Agentic AI
- Security
- Regulation
- Emerging Technologies

### Main user-facing areas

- Home / ForYou
- Trending
- Topics
- Content Detail
- Search
- Bookmarks
- Dashboard
- AI Assistant

## 9. Functional requirements

| ID    | Requirement                                                                                                                      |
| ----- | -------------------------------------------------------------------------------------------------------------------------------- |
| FR-01 | System shall ingest publicly accessible content through configured public APIs and RSS feeds.                                    |
| FR-02 | System shall capture title, description, URL, publisher, publication date, author, tags and engagement/comments where available. |
| FR-03 | System shall refresh sources manually and/or on a schedule.                                                                      |
| FR-04 | System shall avoid unnecessary duplicate records.                                                                                |
| FR-05 | System shall identify content relevant to the Data Center domain.                                                                |
| FR-06 | System shall classify content into configurable topics.                                                                          |
| FR-07 | System shall generate concise summaries and extract technical/business insights.                                                 |
| FR-08 | System shall assign relevance and quality scores with documented scoring logic.                                                  |
| FR-09 | System shall distinguish general news, technical research, investment intelligence and actionable engineering ideas.             |
| FR-10 | System shall offer Trending, topic-based, related and ForYou recommendations.                                                    |
| FR-11 | System shall use local preferences and reading activity for basic personalization without registration.                          |
| FR-12 | System shall provide a responsive interface with the specified discovery screens.                                                |
| FR-13 | System shall provide search, filtering, sorting and pagination/infinite loading.                                                 |
| FR-14 | System shall provide an AI assistant that answers questions from collected content with source references and links.             |
| FR-15 | System shall support JSON and Markdown export.                                                                                   |
| FR-16 | System shall provide basic logging, validation, error handling and administrative safeguards.                                    |

## 10. Non-functional requirements

- **Maintainability:** Separate frontend, API, ingestion, AI processing and persistence responsibilities.
- **Reliability:** Failed source/LLM jobs should be logged and retryable without creating duplicate records.
- **Security:** Secrets remain server-side; validate inputs; restrict administrative operations.
- **Performance:** Paginate feeds; index common filters/search fields; avoid LLM calls during ordinary page reads.
- **Usability:** Responsive layouts, clear content types, visible publisher attribution and clear source links.
- **Explainability:** Show AI summaries as AI-generated and cite source items in assistant responses.
- **Extensibility:** Add sources and content formats without redesigning the core content model.

## 11. User stories

- As a user, I want to see a relevant ForYou feed so I can quickly discover useful content.
- As a user, I want to filter by content type so I can choose articles, videos, research or discussions.
- As a user, I want to explore topics so I can focus on cooling, power, GPUs or sustainability.
- As a user, I want an AI summary and key insights so I can assess an item quickly.
- As a user, I want to bookmark an item so I can revisit it.
- As a user, I want to search by keyword and filter results.
- As a user, I want to ask a question and receive an answer supported by collected sources.
- As an operator, I want to trigger ingestion and inspect job status so I can verify the pipeline.

## 12. Success measures for the prototype

These are evaluation measures, not guaranteed outcomes:

- At least one API source and one RSS source successfully ingest records, subject to access.
- Duplicate URL attempts do not create duplicate content records.
- Relevant content is categorized and enriched, with failed AI jobs visible.
- User can navigate all P0 screens and open original sources.
- Assistant answers include source references from retrieved records.
- Dataset target is 500 relevant records where source access permits; document actual achieved count and limitations.
- App can be started from documented instructions and deployed in a reproducible way.

## 13. Assumptions and risks

| Item            | Assumption / risk                                    | Mitigation                                                   |
| --------------- | ---------------------------------------------------- | ------------------------------------------------------------ |
| Source access   | Public APIs/RSS may have limits or change            | Build source adapters and record source errors               |
| Video text      | Transcript may not be available                      | Use metadata only; do not fabricate content summaries        |
| LLM quality     | Classification and scores may be inconsistent        | Structured outputs, validation, retry and manual spot checks |
| Dataset size    | 500 relevant records may be difficult in timebox     | Use multiple permitted sources; report actual count          |
| Costs           | LLM calls can become expensive                       | Batch, cache, process once, cap input and track usage        |
| Personalization | No account identity                                  | Browser local storage for MVP                                |
| Search          | Full-text search may not capture semantic similarity | Use PostgreSQL FTS first; vector search is a stretch goal    |

## 14. Open decisions

- Confirm the final LLM provider/model and cost budget.
- Confirm the exact initial RSS/API sources and permitted usage.
- Decide whether video transcripts are in scope based on accessible, permitted transcript sources.
- Decide hosting provider after checking deployment constraints.

## 15. Current build phase override — 5 November 2026

The user explicitly requested the complete non-AI frontend/backend first and deferred AI implementation. The PRD remains the final product target; this phase does not remove AI requirements permanently. Use Prisma Client for application queries, as explicitly requested. Keep React/Vite, JavaScript/JSX, Tailwind, Lucide, React Router, Express, PostgreSQL and Docker.

In this phase, publisher descriptions and public metadata are displayed directly; no summaries, insights, relevance/quality scores, model classifications or assistant answers are generated. Metadata keyword rules provide transparent topic labels and a basic domain gate; they are not AI processing. Ranking omits unavailable AI signals. Hacker News (Algolia public API) and Data Center Knowledge RSS were approved by the user as initial public sources. Public video/research metadata can be imported through operator-only tooling; no transcript extraction or video watching is claimed.

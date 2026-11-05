# Working Notes and Interview Explanation — NewsDC

This document is a speaking aid. Explain the system in your own words and only claim features that are actually implemented and verified.

## 1. 30-second product explanation

“NewsDC is an AI-powered Data Center intelligence discovery platform. Information about Data Center infrastructure, AI compute, GPUs, power, cooling, sustainability and investments is scattered across many websites and content formats. NewsDC ingests publicly accessible articles, videos, research and discussions, normalizes and deduplicates them, uses AI to identify relevant content and generate summaries/insights, and presents the results through personalized feeds, topic discovery, search and an AI assistant that cites the underlying sources.”

## 2. What problem does it solve?

- Information fragmentation across many sources.
- High volume of irrelevant or duplicate content.
- Manual effort required to categorize and summarize information.
- Difficulty finding relevant technical and business insights.
- Need to ask cross-source questions and trace answers back to sources.

## 3. Why articles and videos together?

The assignment asks for news, research, articles, discussions and technical developments. HackerTube is a reference for discovery/recommendation behavior, not a requirement to make NewsDC video-only. A unified content model allows multiple formats without building separate applications. Articles and discussions are the first processing priority; video summaries depend on available transcript/text evidence.

## 4. Why React instead of Next.js?

The assignment permits React. A Vite-based React SPA is sufficient because the MVP is an interactive discovery dashboard and does not require server-side rendering for its core workflow. It keeps the frontend simple and allows the Express backend to own API and AI responsibilities.

## 5. Why PostgreSQL instead of MongoDB?

The assignment explicitly suggests PostgreSQL or SQLite. The data has clear relationships: publishers publish content, content belongs to multiple categories, tags map many-to-many, and ingestion runs track source activity. PostgreSQL offers relational integrity, transactions, JSONB for flexible metadata and built-in full-text search. It is not strictly MERN, and that is a deliberate trade-off.

## 6. Why Node.js and Express?

- Same primary language across client and server.
- Good ecosystem for HTTP APIs, RSS clients and asynchronous I/O.
- Express provides a small, understandable API layer.
- AI and ingestion logic can be isolated in service modules.

## 7. Why modular monolith?

The deadline is 3–4 working days. A modular monolith provides separation of concerns without the operational complexity of multiple independently deployed microservices. Ingestion/AI can run as a separate worker process using the same codebase when needed.

## 8. Explain the ingestion pipeline

“Each source has an adapter. The adapter fetches public records and maps source-specific fields into a common content object. We validate required fields, canonicalize the URL, check duplicates, persist the record and enqueue enrichment. We track each ingestion run and record failures so that one broken source does not stop all other sources.”

## 9. Explain duplicate detection

“First, we canonicalize URLs by normalizing host/path and removing known tracking parameters. A unique database constraint protects canonical URLs from race conditions. A content fingerprint can detect likely duplicates when URLs differ. We avoid aggressive normalization that could merge distinct articles.”

## 10. Explain AI classification

“We send the title, description and available permitted text to an LLM with a constrained taxonomy and JSON output schema. The model returns relevance, categories, intelligence type, summary, insights and scores. We validate the response against allowed values and ranges before storing it. If content is irrelevant, we do not spend additional tokens on full enrichment.”

## 11. Explain quality and relevance scores

“Relevance measures how directly the item relates to Data Centers. Quality is a heuristic estimate based on specificity, evidence/detail and usefulness. They are not objective truth or a universal publisher rating. We document the rubric, retain model/prompt provenance and can manually review samples.”

## 12. Explain recommendations

“For the MVP, we use a transparent heuristic rather than training a recommendation model. We combine relevance, quality, freshness, available engagement and local topic preferences. Trending emphasizes recency and engagement; ForYou adds user-selected topic/type preferences. We can improve this with feedback and semantic similarity later.”

## 13. Explain RAG / AI assistant

“The assistant does not ask the LLM to answer from general knowledge alone. We first retrieve relevant indexed content using PostgreSQL full-text search, pass bounded excerpts and metadata to the LLM, and require it to cite retrieved content IDs. The backend validates those IDs and returns links. If retrieval is weak, it should say there is insufficient indexed evidence.”

## 14. Why no login?

The assignment explicitly says no registration is required and recommends browser session/local storage for preferences and history. This reduces scope and friction. Server-side user accounts and cross-device synchronization can be future enhancements.

## 15. How do videos work?

“We store video metadata and the original URL. If a permitted transcript is available, we can process it. If not, we can classify using metadata but do not claim to summarize the actual video. Playback remains on the original platform.”

## 16. How do you control LLM cost?

- Process only new or changed records.
- Store output and avoid repeated summarization.
- Use a content fingerprint and prompt version for cache identity.
- Limit input length and output tokens.
- Filter irrelevant items before expensive enrichment.
- Track model usage and set job/run limits.

## 17. What happens when an LLM/source fails?

“Source and AI processing are separate from feed reads. We record status and errors, use bounded retries for transient errors, and keep the original metadata. A failed AI item can be retried without re-ingesting the whole source. The rest of the app can still show previously processed content.”

## 18. What would you improve next?

- More permitted sources and source health monitoring.
- Transcript ingestion for videos where allowed.
- Hybrid keyword and vector search.
- Better reranking and feedback-based recommendations.
- Trend detection over time.
- User accounts and cross-device preferences.
- More rigorous evaluation datasets for relevance and summary quality.

## 19. Honest implementation status

Before the interview, fill this in with real facts:
- Sources integrated: [list]
- Records ingested: [actual count]
- AI provider/model: [actual]
- AI stages implemented: [actual]
- Content types actually supported: [actual]
- Search method: [actual]
- Deployment URL: [actual]
- Known limitations: [actual]
- AI coding agent tasks: [actual]
- Manually verified items: [actual]

Never present planned functionality as completed functionality.

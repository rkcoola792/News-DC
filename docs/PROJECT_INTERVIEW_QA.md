# NewsDC project interview preparation

Prepared for the project owner on 8 November 2026.

This is a study manual for explaining NewsDC to a client or interviewer. It covers the product, each implemented feature, data storage, source collection, AI processing, frontend, APIs, deployment, failure handling and engineering tradeoffs. Answers describe the checked source code; dated runtime observations are identified separately. No application tests or live provider calls were run to write this manual.

Practise the short answer first, then explain the mechanism in your own words. Suggested first-person answers describe the application you delivered; they do not imply you personally typed every line or discovered every recorded bug. Be open about AI assistance and avoid claiming debugging experiences you cannot explain.

## How to study this guide 

1. Learn questions 1 to 12 so you can explain the complete system without opening the code.
2. Study the feature sections while opening the corresponding screen and source files.
3. Draw the two flows in question 7 from memory.
4. Practise the scenario questions and the client demonstration near the end.
5. Before presenting, inspect the actual deployed Dashboard and replace historical figures with current, dated figures. 

Sections: product and architecture; storage; ingestion; AI enrichment; assistant; discovery and search; reader features; operations and security; deployment and testing; engineering scenarios; client demonstration; glossary and code map.

## 1 Product and architecture

### Q1 What problem does NewsDC solve

**Say:** “NewsDC helps people follow the data center industry without repeatedly checking disconnected news sites, research libraries and discussion sources. It brings permitted public metadata into one searchable library, adds supported AI analysis and provides answers linked to indexed sources.”

**Understand:** Collection solves fragmentation. Topics and relevance classification reduce noise. Summaries help readers assess an item quickly. Recommendations prioritize material. Citations make it possible to inspect the original evidence. The application helps discovery; it does not guarantee complete industry coverage.

### Q2 Who is it for and what value does each user get

Engineers can follow cooling, power, networking and infrastructure. AI infrastructure specialists can track compute and GPUs. Researchers can discover papers. Strategy analysts can follow investment and economics. A client gets a focused discovery workflow with attribution and operational visibility. Avoid promising that every possible question in these areas already has enough indexed evidence.

### Q3 Give a one minute project introduction

“I built NewsDC as a data center intelligence application using React, Express and PostgreSQL. It collects records through reviewed APIs and feeds, normalizes them into one model and prevents common duplicates. A server-side AI pipeline classifies eligible text and saves summaries, insights and estimated scores. Readers can search, browse topics, personalize their feed and save items locally. The assistant retrieves stored evidence and generates answers with validated source references. The backend records ingestion, processing and provider usage. The application is packaged with Docker, and a public deployment was checked on 7 November. Final dataset and browser acceptance still have gaps.”

### Q4 What is the actual technology stack

React with JavaScript and JSX builds the interface. Vite handles development and frontend builds. React Router handles page navigation. Tailwind CSS, global CSS and theme variables style the UI; Lucide React supplies icons. Node.js and Express provide the API and orchestration. Prisma Client with its PostgreSQL adapter performs application database operations. PostgreSQL stores shared data and supports full-text queries. Zod validates runtime contracts, and fast-xml-parser reads XML feeds. Docker packages the runtime. npm workspaces connect the packages. Hosted Gemini and OpenAI models are accessed through backend HTTP calls.

**Follow-up:** There is no trained recommendation model, vector database, Redis, BullMQ, LangGraph dependency or end-user account system in this implementation.

### Q5 Why React Vite and Express

React allows reusable cards, filters and stateful screens. Vite provides a lightweight development/build workflow for the agreed single-page application. Express keeps HTTP routing and backend modules simple within the assignment scope. The production backend serves the compiled frontend as well as the API. This design suits an interactive MVP; server-rendered public article pages and a comprehensive SEO strategy have not been implemented.

### Q6 What is a modular monolith and why did you use it

**Say:** “The backend is one deployable application with separate modules for ingestion, content queries, AI and operations. That keeps the system understandable without operating several services.”

Modules share the same database and runtime. They are organized by responsibility, but they are not independently deployed microservices. The tradeoff is that timers, provider guards and ingestion locks are currently process-local. Adding several backend replicas requires shared coordination before claiming the same job guarantees.

### Q7 Explain the complete data flow

**Collection and enrichment:** Reviewed API or feed → source adapter → candidate validation → text and URL normalization → duplicate check → PostgreSQL record and topic/tag mappings → optional background enrichment → validated saved output → API response → React screen.

**Question answering:** Reader question and filters → backend validation → PostgreSQL retrieval → reranking and bounded source excerpts → cache lookup → provider gateway if needed → output and citation validation → persisted answer cache → answer and source cards.

Ingestion gets the evidence. Enrichment analyzes individual items. Retrieval selects evidence for a question. Generation writes the proposed answer. Validation controls what the application accepts.

### Q8 How is the repository organized

`apps/web` contains pages, components, hooks and browser storage utilities. `services/api` contains the Express app, routes, ingestion and AI modules. `packages/db` contains Prisma schema/client integration and migration machinery. `packages/shared` contains the shared topic taxonomy. `database/migrations` holds versioned SQL. `docs` holds requirements and implementation records. `scripts` contains setup, smoke and reliability checks. See the final code map for starting files.

### Q9 What belongs to MVP and what is future work

The P0 scope supports collection, normalization, duplicate prevention, relevance, topics, summaries, insights, scores, recommendations, search, details, local reader state, cited assistant, operations and Docker delivery. Implemented P1 additions include exports, research/video metadata and trend summaries. Accounts, cross-device sync, vector search, transcript extraction and learned recommendations remain future scope.

**Acceptance nuance:** Keyboard shortcuts are labelled P2 locally, but the client assignment audit identifies them as an outstanding requested item. Do not call the entire assignment complete just because the local P0 list is implemented.

### Q10 Is this an AI agent application

It contains bounded AI workflows, provider routing and automatic processing. Models receive task instructions, a schema and source evidence. They are not given arbitrary tools to browse websites, execute code or operate the application. Describe it as an AI-powered discovery application with retrieval-based question answering. Do not imply an autonomous web research agent or a LangGraph implementation.

### Q11 What is implemented and what is actually verified

Implementation means the code path exists. Automated verification checks particular contracts and failure cases. Live checks show selected real-source/provider behavior. Browser checks show selected user interactions. Acceptance additionally requires sufficient relevant data, useful answers and agreed workflows. These are different levels of evidence.

The 7 November audit records 80 passing backend/database results and 23 frontend logic results, plus a separate scheduler/outage exercise. The deployment audit records sampled public API success. Neither proves complete AI accuracy, accessibility, security or browser acceptance. These are historical results, not tests rerun for this guide.

### Q12 Is the project deployed and how much data does it contain

The 7 November deployment audit checked `https://news-dc.onrender.com/` and observed a working HTTPS frontend and sampled backend flows. It recorded 162 publicly visible deployed records: 50 articles, 50 research, 41 discussions and 21 videos. The separate local audit recorded 736 total records, including 176 AI-confirmed relevant and 560 unclassified; the deployment comparison saw 731 publicly visible local records at its own snapshot.

**Say:** “Local and production have separate collections. I report current counts from the environment being demonstrated. Total indexed records are different from AI-confirmed relevant records.” These snapshots do not establish today's availability or completion of the 500-relevant-record target. Older documentation saying deployment is pending is superseded by the dated deployment audit for that observation.

## 2 Data storage and database design

### Q13 Where is every kind of data stored

Shared content, publishers, collection sources, topic/tag mappings, AI results, ingestion runs, processing logs, provider usage, output caches and operator settings live in PostgreSQL. Bookmarks, reader preferences, reading history and theme live in browser localStorage. Assistant exchanges are temporary React state. The server's assistant answer cache is separate from that screen state. Secrets are supplied to the backend environment; the operator credential is held in Dashboard memory after entry.

### Q14 What exactly is stored for a content item

The common record includes a UUID, content format, title, description, original URL, canonical URL, source and publisher references, optional author, publication time, image, duration and supplied text. It also includes fingerprint, AI status and output fields, flexible JSON metadata, creation time and update time. Missing optional values remain null. An article, research paper, discussion and video fit the same basic model, with format-specific provenance in metadata.

### Q15 Why use PostgreSQL rather than a document database

**Say:** “Our data has relationships, unique identities and multi-step updates. PostgreSQL gives us transactions, foreign keys, uniqueness and full-text search in one database.”

For example, saving a content record and replacing its topic mappings must be consistent. JSON metadata still accommodates flexible source fields without making every attribute a separate table. This is a project fit decision, not a claim that document databases are always unsuitable.

### Q16 Why use Prisma and do you write SQL

Prisma provides structured application queries, relationships and transactions. Application services use methods such as `findMany`, `upsert`, `updateMany` and `$transaction`. The project explicitly confines handwritten SQL to versioned schema migration machinery and database-specific test infrastructure. Prisma calls still result in SQL executed by PostgreSQL. Database checks and generated search fields require understanding the database even when an ORM is used.

### Q17 What is the difference between a source and a publisher

A source is how NewsDC discovers a record: an adapter and collection endpoint. A publisher is the originating domain associated with the item. Hacker News can discover a story linking to another publisher. Keeping them separate preserves collection provenance and original attribution. Repeated discovery does not imply the application has a complete many-to-many history of every source that ever linked the story; the common item has one source reference plus metadata.

### Q18 Why are categories and tags separate

Categories are the 14 controlled product topics shared across frontend and backend. Tags are labels supplied by a source. A source tag such as an arXiv subject code is not automatically a product topic. AI may replace initial keyword categories with validated topic slugs; source tags remain distinct. Both use mapping tables so a single item can have multiple labels without duplicating its main record.

### Q19 Explain the relationships and junction tables

One publisher can have many content items; one source can have many items and ingestion runs. Content and categories have a many-to-many relationship through `content_category_map`. Content and tags use `content_tag_map`. Their composite primary keys prevent repeating the same mapping. Processing logs reference the relevant item. Deleting an item cascades through selected dependent mappings/logs. A `content_relations` table exists, but the current related-content endpoint computes shared-topic matches directly.

### Q20 What is a transaction and where does it matter

A transaction commits a group of database changes together or rolls them back together. During ingestion it protects publisher/content/mapping updates. During enrichment it protects AI output, categories and job completion. Without it, an item could say completed while its topics or summary failed to save. Some enrichment claim/save operations use serializable isolation, which can reject conflicting concurrent transactions; this is not a guarantee that conflicts never need retry.

### Q21 How does the database prevent duplicates and invalid data

Unique canonical URLs and fingerprints protect item identity; unique publisher domains and tag names avoid repeated shared rows. Foreign keys protect references. Mapping primary keys prevent duplicate relationships. SQL check constraints protect selected statuses, formats and score ranges. Zod rejects malformed input before storage. Application checks help explain failures; database constraints provide a second boundary when requests race.

### Q22 What is stored in JSON metadata and why

Examples include original discovery URL, HN points/comments, research authors and DOI, video metadata status, source text scope and AI evidence/provenance. JSON supports different source formats without frequent schema expansion. Frequently filtered shared properties, such as content type and relevance score, remain structured columns. JSON is flexible but still needs validation and stable conventions; it does not replace relational design.

### Q23 How does database migration work

Numbered SQL files define schema evolution. The runner takes a database advisory lock, checks previously applied names and SHA-256 checksums, applies new files transactionally and records them. An edited applied migration fails the checksum check: add a new migration instead. Six versioned migrations exist in this snapshot. Prisma schema/client generation describes and exposes the database to application code; the custom SQL runner applies these versioned changes.

### Q24 How do indexes help and is search automatically optimized

The schema includes indexes for publication order, type/date, relevant status, mappings and a GIN index on a generated search vector. Indexes can speed matching access patterns at a storage/write cost. Important detail: application search uses Prisma field-level full-text operators and `_relevance`; the code does not directly query `search_vector`. Its indexed presence alone does not prove Prisma queries use it. Verify real query plans and latency before claiming indexed search performance at scale.

### Q25 What persists after a restart and is it backed up

In local Compose, PostgreSQL uses a named volume, so ordinary app/container recreation preserves database records, caches and settings. Browser state survives normal reloads when storage is allowed. In-memory guards and chat exchanges disappear. Deleting the database volume removes its data. A volume is persistence, not a backup strategy. Production backup/restore configuration is not established by the local Compose file or the public deployment audit.

## 3 Source collection and ingestion

### Q26 Where does the content come from

The source registry has four entries: HN data center stories through Algolia, Data Center Knowledge RSS, arXiv research through Atom and a dedicated HN video discovery query. YouTube oEmbed enriches supported video links with public metadata. Operator imports accept bounded metadata batches against an existing source. These are reviewed collection paths, not a reader-controlled arbitrary website crawler.

### Q27 What is an adapter and why use one per source

An adapter converts a provider-specific response into the common candidate shape. HN JSON, RSS XML and arXiv Atom expose different names and nesting. After adaptation, normalization and persistence can work with a common title, URL, type, description, date, tags and metadata. Adding a source requires reviewing its permitted use, defining its mapping and request limits, registering the endpoint and testing missing/malformed responses.

### Q28 What happens when an operator presses Run ingestion

The protected endpoint validates source IDs and checks for an existing run. Enabled sources get persistent pending run records. The API returns HTTP 202 with run IDs while execution continues in the backend process. Sources run sequentially. Each run fetches candidates, validates/stores them and updates inserted, skipped and failed counts. The Dashboard can inspect persistent run status. Accepted means work started, not that every item succeeded.

### Q29 What normalization is performed

The normalizer strips markup, decodes selected entities, collapses whitespace and bounds text length. It validates a nonempty title, supported format, HTTP(S) URL without embedded credentials, optional duration and date. It derives publisher domain, canonical URL and fingerprint. These actions make mixed-source metadata predictable. Text cleaning is not a full HTML rendering/sanitization system; the frontend renders text rather than executing upstream HTML.

### Q30 Explain duplicate detection with an example

`https://example.com/story?utm_source=feed#section` is canonicalized to remove selected tracking parameters and the fragment. Query parameters are sorted; meaningful remaining parameters are preserved. The service searches by canonical URL or SHA-256 fingerprint derived from lowercased normalized title plus domain. A unique constraint handles competing inserts. Repeating a record generally refreshes supported metadata instead of inserting a second row.

**Limit:** Different publishers writing similar stories are not universally merged. The fingerprint is conservative string-based detection, not semantic analysis. Also, the skipped counter includes refreshed duplicates; “skipped” does not always mean nothing changed.

### Q31 How does reingestion handle changed content

Duplicate refresh can update supplied descriptions, authors, dates, thumbnails, metadata and tags, with special handling when upgrading video discovery. It compares the old and new enrichment input hash. If the evidence changes, it clears dependent AI fields, restores keyword topic labels and marks the item pending. Unchanged AI input can retain enrichment. Do not claim every field is overwritten on every refresh: optional updates and the generic duplicate path are deliberately limited.

### Q32 What happens to source tags on refresh

Omitting `tags` preserves the mappings. Supplying `tags: []` clears them. A supplied list replaces the mappings transactionally. Normalization strips markup, collapses whitespace, applies Unicode NFC and lowercase and removes duplicates. There can be at most 100 raw entries, 30 unique normalized labels and 80 characters per normalized label. Invalid tags fail the candidate rather than silently corrupting stored labels.

### Q33 Are keyword topics the AI relevance classifier

No. `classifyTopics` initially checks metadata using regular expressions. A separate metadata relevance gate filters API-source candidates using explicit domain phrases. RSS does not pass through that same API gate. These are preliminary rules, not generated summaries or AI-confirmed relevance. Successful AI enrichment later supplies relevance/confidence and controlled topics. Unclassified visible records must not be counted as confirmed relevant.

### Q34 What does Hacker News contribute

HN supplies story/discussion discovery, original links, available post text, author, timestamp, points, comments count and discussion link. HN records normally use the DISCUSSION format, even when the linked URL is another publisher's article. The application does not fetch an entire comment thread or linked article body in this path. Available engagement is source-specific; it is not universal popularity across all formats.

### Q35 How does research discovery work

The arXiv adapter requests bounded title-query results for data center variants, parses Atom and keeps paper title, abstract, authors, source categories, versioned ID and available DOI/journal reference. The abstract is stored as the source description. It does not download PDFs or claim full-paper analysis. Requests are serialized with at least three seconds between them within the process, including recovery after failure.

### Q36 What is research backfill

Ordinary refresh fetches a recent page. Backfill walks reviewed pages of older research metadata, using page size 50 and offsets from 0 through 550. The protected API accepts one to twelve pages, records progress and reuses deduplication and pacing. It is not an unrestricted query proxy. A prior run recorded 550 inserted and 50 duplicates across twelve pages; that historical run does not establish today's production dataset or relevance count.

### Q37 How are videos discovered and what is actually extracted

HN stories containing supported YouTube URLs are normalized to a video ID and watch URL. The dedicated query deduplicates IDs and considers at most 20 video candidates; ordinary HN discovery also upgrades a bounded number. oEmbed provides available title, channel and an approved thumbnail. Publication date is left unknown rather than copied from HN discovery time. No video download, audio analysis, transcript extraction, guaranteed duration or hosted player is implemented.

### Q38 What if a video or source is unavailable

Video metadata failure preserves safe discovery metadata and a status such as `UPSTREAM_404` or `UNAVAILABLE`. The 7 November audit recorded two video metadata 404s and an outstanding need for clearer UI messaging. Generic source failures record a failed run. The application must not fabricate an available video or transcript. Original playback availability was not certified for every discovered link.

### Q39 How are fetches bounded and retried

Generic reviewed source fetches use a 10-second timeout, no redirects, a two-million-byte response limit and at most two attempts. Certain responses, including 403, 404 and 429, avoid immediate retry. YouTube metadata uses its own 8-second timeout and 64,000-byte bound. arXiv pacing is additional. These are different policies from the AI gateway's retries. Bounds reduce runaway work but do not guarantee upstream uptime.

### Q40 Is refresh automatic and can jobs overlap

Scheduled ingestion is opt-in through `INGESTION_ENABLED`. The default interval is 30 minutes with a one-minute minimum. Manual and scheduled work share an in-process ingestion guard. Backfill also checks relevant busy state. A separate automatic AI setting controls enrichment; enabling one does not imply the other is on. These guards do not coordinate several independent backend replicas.

### Q41 Can one bad record break the whole import

Each candidate has its own validation/storage handling. Successful records can commit while another fails. The final run can be FAILED with nonzero inserted count, so inspect all counters. Error summaries are bounded and safe. Upstream fetch failure affects that source run. The metadata import response can return HTTP 200 with a failed run object; the latest audit identifies the Dashboard's generic success message as a presentation issue to fix.

## 4 AI enrichment and provider routing

### Q42 What is AI enrichment in this application

It adds relevance/confidence, up to five controlled topics, intelligence type, summary, up to three insights and estimated relevance/quality scores to eligible source text. Instructions and schema are submitted as one structured generation task; separate responsibilities do not mean seven separate model calls per item. The accepted result and evidence provenance are persisted. Ordinary feed/detail reads reuse it rather than regenerating it.

### Q43 Did you train or fine tune a model

**Say:** “No. I integrated hosted models. The engineering work is collecting evidence, selecting bounded inputs, designing the output contract, routing failures, validating results and maintaining current saved outputs.”

Prompting is task instruction. Retrieval chooses stored evidence at request time. Training changes model parameters. NewsDC implements the first two, not training or fine tuning.

### Q44 Which providers and models are used

The inspected `aiConfig` code selects Gemini first and OpenAI as fallback, with code values `gemini-3.5-flash-lite` and `gpt-5.4-mini`. These are observed configuration values, not an independently checked statement of today's model availability, pricing or a permanent client commitment. Keys are `GEMINI_API_KEY` and `OPENAI_API_KEY` on the server; `AI_PROVIDER_ENABLED` controls new generation. The gateway requires the primary Gemini key before starting.

### Q45 Exactly how do retries and fallback work

An initial Gemini call may get two additional attempts for temporary failures, then at most one OpenAI attempt if configured. Typical temporary backoff is two then four seconds, adjusted for supported Retry-After. Permanent errors skip futile Gemini retries and may proceed to fallback. Safety refusal and oversized input stop without fallback. Daily quota detection avoids repeated immediate retries. Accounting/storage failures fail closed. Maximum provider attempts is four, but many paths stop earlier.

### Q46 What limits remain after spending caps were removed

The user explicitly removed application spending and fixed daily request caps. Usage accounting remains. The gateway bounds task size, serialized request size, response bytes and output tokens; provider fetches have a 20-second timeout. One process-level provider guard allows one active generation. Public API traffic also has short-term throttling. Provider quotas still apply. Historical tables named budget or daily usage are not evidence that the removed caps are enforced.

### Q47 Is the full answer guaranteed within twenty seconds

No. Twenty seconds is a per-provider-fetch timeout, not an end-to-end response promise. Several attempts, backoff, database operations and an interactive wait for the provider slot can add time. A 7 November deployed assistant sample took 13.6 seconds, but one sample is not an SLA or latency percentile. The UI needs loading, explicit failure and retry behavior for slower requests.

### Q48 Which records are eligible for a summary

The pipeline uses supplied text when available, otherwise description/abstract, normalized to at most 6,000 characters; title is bounded to 1,000. Text must have at least 160 characters and 25 words. Video requires stored text and `transcriptPermitted === true`. Thin input is marked skipped without a provider call. Research without supplied full text is labelled abstract-only; source descriptions are not presented as full articles.

### Q49 Where does the supplied body or transcript come from

Current reviewed discovery adapters principally provide metadata, descriptions and abstracts. They do not automatically fetch article bodies, papers or transcripts. Although the database/enrichment contract supports `content_text`, the current generic ingestion path does not populate arbitrary imported bodies simply because an extra field was sent. Do not promise full-text import or transcript support without implementing a reviewed input path and verifying it. The model can analyze only what the backend actually supplies.

### Q50 How do you stop malformed model output

The task requests a JSON schema. The gateway parses JSON and invokes the task validator. Zod checks allowed fields, required structure, controlled enums, score ranges and supported evidence. Enrichment validates again before database persistence. Unknown topics, unsupported evidence and inconsistent states are rejected. Invalid output can follow the gateway's bounded response retry policy; it is never silently accepted to make the UI look successful.

### Q51 How does supporting evidence work for enrichment

The backend splits source text into bounded excerpts with IDs such as E1. The model chooses allowed evidence IDs. The server resolves them to original excerpts and validates quote membership in supplied text. Summary/insight evidence is stored and shown in expandable detail. The history records replacing brittle model-written quote strings with this ID-based contract after validation failures. This validates evidence identity and presence, not every logical inference.

### Q52 What is an intelligence type versus a content type

Content type is the format: ARTICLE, VIDEO, RESEARCH or DISCUSSION. Intelligence type describes analytical purpose: general news, technical research, investment intelligence, engineering ideas or other. A discussion could contain an engineering idea; an article could contain investment intelligence. Keeping these dimensions separate avoids forcing format to imply meaning.

### Q53 What do relevance quality and confidence mean

Relevance score, from 0 to 100, estimates directness and depth of data center relevance. Quality score, from 0 to 100, estimates detail, evidence and usefulness of supplied text. Confidence, from 0 to 1, expresses the model's confidence in relevance classification. They are different fields. None is a measured accuracy rate or a certified publisher credibility rating. Reasons and source scope help readers interpret them.

### Q54 How are irrelevant and insufficient items handled

The enrichment contract prevents unsupported summaries/insights/quality values for irrelevant or insufficient evidence. Explicitly irrelevant records remain stored for operations but are excluded from public feed/search/related listings and visible topic counts. Unclassified records can remain visible, so public visibility does not mean verified relevance. Direct detail-by-ID is a separate read path; do not claim irrelevant records have been physically deleted or made universally inaccessible.

### Q55 How do you avoid stale summaries

The identity includes prompt version and a SHA-256 hash of the actual normalized model input, including evidence scope and publication date. Changed input clears dependent fields and queues pending work. Before saving a generated result, the service reloads the row and checks ownership and the current input hash. If input changed during generation, it discards the stale result. Public serialization exposes generated values only when currentness checks pass.

### Q56 Why not regenerate when engagement changes

HN points/comments can change without changing text evidence. They do not belong to the enrichment input hash, so they can update ranking without paying to summarize the same text again. This separates analytical evidence from incidental metadata. A provider model change alone is not included as a new enrichment cache identity in this implementation; deliberate reprocessing/version policy is needed when the client requires all results from a new model.

### Q57 How does automatic enrichment work

`AI_AUTO_ENRICHMENT` enables an in-process loop, normally every five seconds. It checks a persisted pause setting and avoids active assistant/provider/enrichment work. It inspects at most ten pending rows, skips thin inputs and processes eligible work incrementally. Ingestion wakes the loop. When pending work drains, it can refresh trend summaries. Failed jobs require explicit retry rather than an endless retry loop. This is not a durable Redis queue.

### Q58 What happens if the server crashes during AI processing

Item and job records persist. On startup, interrupted processing is marked failed instead of falsely completed; logs remain for review/retry. Old prompt-version results are invalidated. Provider calls and usage are recorded durably, but the implementation does not guarantee exactly-once external model execution through every crash window. Restart may require retry and another call. Describe the recovery honestly.

## 5 Assistant and retrieval

### Q59 What is RAG and how is it used here

RAG means retrieval-augmented generation: first retrieve relevant stored evidence, then include it in a model request to answer a question. NewsDC uses PostgreSQL full-text retrieval through Prisma, not embeddings. It bounds the context and validates source references. RAG does not automatically guarantee truth; results depend on source coverage, retrieval quality and whether the model's claims follow from the evidence.

### Q60 Walk through one assistant request

The reader sends a 3-to-500-character standalone question and optional content-type, topic and date filters. The backend validates them, extracts query groups, retrieves up to 80 candidates, reranks and selects at most five usable excerpts. It checks an evidence-sensitive cache. If uncached and capacity is available, the provider returns structured cited paragraphs. The backend validates IDs, constructs original links from stored records, saves the response and returns it. No usable retrieval means an insufficient-evidence response without a model call.

### Q61 How are relevant sources selected

The query builder removes common question words and uses up to eight meaningful groups with selected aliases, such as cooling/thermal/liquid or GPU/accelerator. PostgreSQL performs OR-style full-text candidate matching. Application reranking gives four points for a group matching the title or two for matching body/description. Safe-URL and minimum excerpt checks remove unusable rows. The highest ranked five supply excerpts of at most 1,000 characters each.

**Limitation:** This is a bounded lexical heuristic. It can miss conceptual matches or prefer older strong keyword matches. Asking for “latest” does not itself enforce a recent date window; explicit filters matter.

### Q62 Does the assistant search the internet or use all database text

It does not browse live websites. It uses the selected indexed excerpts supplied in that request. Full-text retrieval can match stored summaries, but the selected evidence excerpt comes from supplied text or source description, not automatically from the generated summary. That helps ground answers in source material. Newly published material is unavailable until collected, and inaccessible full text is not magically available to the model.

### Q63 How do you prevent fabricated citations

Sources receive temporary IDs such as S1. The model can cite only the allowed source-ID set, and factual paragraphs require IDs. Unknown references and model-generated HTTP URLs in paragraph text fail validation. The backend resolves IDs to real content UUIDs and trusted stored URLs, then returns source cards. A link can therefore be structurally valid while its associated claim still needs human semantic review.

### Q64 What if there are matches but they do not answer the question

The model can return insufficient evidence with no answer paragraphs. The contract rejects an inconsistent shape, such as declaring insufficient evidence while also supplying answer paragraphs. The UI explains the limitation. A match on “GPU” does not establish evidence about GPU utilization improvement. In the 7 November sample checks, GPU-utilization and combined PUE/WUE questions lacked sufficient support; do not invent a success story for them.

### Q65 How does assistant caching work

A SHA-256 key includes the normalized question, filters, prompt version and selected sources/excerpts. Accepted answers are stored in `ai_output_cache` for 24 hours and can survive restarts. Changed evidence changes the key. A cached request still performs retrieval before deciding whether the existing answer matches. Similar but differently worded questions are not guaranteed to share a semantic cache. Cache hits reuse output; they do not certify that output as correct.

### Q66 Does the assistant remember the conversation

The screen keeps up to five exchanges in memory, but the backend receives one question and filters per request. Previous messages are not sent as model context. Ask “How does liquid cooling affect power requirements?” rather than “How does that affect it?” unless you repeat the necessary subject. Multi-turn memory is a possible future improvement, not an implemented capability.

### Q67 How do you handle prompt injection

Question and source text are explicitly treated as untrusted data. Task instructions restrict generation to supplied evidence. The model receives no arbitrary browsing or execution tools. Schemas, allowed IDs and server-side URL resolution restrict output. This reduces exposure; it does not prove immunity to malicious source text or semantic misinformation. Never claim that adding one instruction completely solves prompt injection.

### Q68 What are the assistant's current limitations

Collection coverage, thin text, abstract-only research and absent video transcripts bound answers. Lexical retrieval and a five-source context can miss useful evidence. The UI has no real backend conversation memory. One shared provider slot limits throughput. The 7 November audit also observed internal S-number markers in paragraph prose; the code translates them in limitations but does not sanitize all paragraph prose. These are concrete improvement areas, not reasons to substitute fabricated answers.

## 6 Search recommendations topics and trends

### Q69 How does ordinary search work

The backend extracts at most 20 letter/number terms from a query of at most 200 characters. It joins terms with AND and uses Prisma full-text conditions across title, description, supplied text and stored summary. A field can satisfy the combined query; terms spread across separate fields do not necessarily match that same field-level condition. Filters and pagination are applied in the database. This is keyword full-text search, not vector or semantic search.

### Q70 What filters and sorting are supported

Backend filters include type, category, publisher, date boundaries, minimum quality/relevance, explicit IDs and timeframe. Sort values include publication date, relevance, quality and title, with ascending/descending order. Search relevance with a query uses Prisma `_relevance` over title and description; the same sort label without a query follows the stored relevance-score field. Defaults and supported controls should be explained from the current screen rather than assuming every API option has a visible control.

### Q71 How do filters and preferences differ

A filter narrows which items are eligible. Preferences influence ordering in For You without necessarily hiding all other subjects. For example, selecting a research-only filter removes articles from that query; preferring research boosts matching items in a mixed feed. This gives readers exploration while still favoring their interests. The backend validates preference slugs/types instead of accepting client-provided scores.

### Q72 Explain the For You formula

For You score = 200 for any preferred-topic match + 100 for preferred-format match + 0.10 × freshness + 0.02 × engagement − 20 when already read + current AI bonus.

Freshness = 100 × exp(−max(0, age in days) / 7). Engagement = min(100, 15 × ln(1 + nonnegative HN points)); absent points contribute zero. AI bonus = 0.40 × relevance score + 0.25 × quality score, only for current enrichment. Topic matching is a single boolean bonus, not 200 for each topic. The service ranks at most the latest 1,000 matching candidates.

### Q73 Give a worked recommendation example

For an illustrative new item with a preferred topic and format, zero points, not yet read and no current AI output: score = 200 + 100 + 10 = 310. If marked read, it becomes 290. With current relevance 90 and quality 80, the AI bonus is 36 + 20 = 56. These are made-up numbers to explain the formula, not a stored item or measured user outcome. An item matching two preferred topics still receives a topic bonus of 200.

### Q74 Is personalization machine learning

The recommender is a deterministic weighted heuristic using explicit preferences, read IDs, recency, available engagement and saved model-assisted scores. It does not train from clicks, perform collaborative filtering or infer an individual user embedding. Weights make the MVP explainable; they have not been established as optimal by an experiment. A learned model should follow sufficient data, consent and measurable product benefit.

### Q75 How is Trending different from For You

Trending score = 0.80 × freshness + 0.20 × available engagement + the same current AI bonus. It emphasizes timely material and available signals rather than preferred-topic/type bonuses or read penalties. Timeframes include all, 24 hours, seven days and thirty days. Missing publication dates use creation time for freshness, but date/timeframe filtering relies on publication time; undated videos can therefore behave differently under those filters.

### Q76 What are emerging theme reports

Theme reports compare topic counts in the latest seven days against the prior seven, using up to 1,000 date-eligible publicly eligible records. A topic needs at least two current items and positive absolute growth; at most three themes are selected. The model summarizes supplied examples with validated IDs from the same topic. A one-hour cache uses day/source-sensitive identity. Public reads return saved state; protected refresh or automation performs generation.

**Say:** “These are changes in our indexed collection, which can be biased by source coverage. They are not proof that the whole industry grew at that rate.” No previous items means growth percentage is null, not an invented percentage.

### Q77 How do Topics and related content work

Topics lists the 14 shared controlled categories and counts their eligible mapped items. One item can appear in multiple topic counts. Clicking a topic loads a filtered feed. Related content finds up to five other publicly eligible items sharing topics, ordered by publication recency. It does not compute embedding similarity or exclusively find discussion threads. Explicit new-topic discovery and dedicated related-discussion requirements were not separately demonstrated in the audit.

### Q78 How do pagination and stable ordering work

The API defaults to page 1 and limit 20, with maximum page size 100. Normal listings query a page and count, use stable ID tie-breakers and recover to the last valid page if needed. Ranked feeds load up to 1,000 matching candidates, sort in Node and slice the requested page. The response total for ranked feeds reflects that bounded set. Stable ordering reduces ties, but changing data between requests can still move records; this is not snapshot or cursor pagination.

### Q79 What do JSON and Markdown exports contain

Exports reuse listing filters and force the first page with a 100-record limit. JSON includes structured serialized records and the export limit; Markdown produces a reading list with title, format, publisher, description and original URL. Markdown is not a complete dump of every AI field. The export route uses the generic listing path, so it should not be promised to reproduce personalized For You order. Attribution remains visible.

## 7 Reader screens and frontend behavior

### Q80 What happens when the home page opens

React Router renders Discover inside the shared shell. Shared context provides local preferences, bookmarks, history, theme and URL filters. The feed builds request arguments and calls For You by default; explicit sorting selects ordinary content listing. Returned records are mapped to UI items and rendered using reusable cards with loading/error/empty states. The browser is not querying PostgreSQL directly; it calls the API.

### Q81 Why use context hooks and reusable components

Context shares browser-level state across screens. Hooks isolate preferences/history and resource fetching. Feed, card, filters and layout components are reused by multiple routes so formats, save behavior and errors stay consistent. React component state is temporary runtime state; localStorage is explicit persistence. No Redux dependency is needed for the current scale of shared state.

### Q82 Why put filters in the URL

URL search parameters preserve query/filter/page state during navigation and make it possible to revisit a search. Changing a non-page filter resets the page so a new smaller result set does not stay on an old page number. React Router reads and updates these values. This is browser navigation state; the server still validates every request because a reader can manually edit the URL.

### Q83 What does the content detail screen do

It loads the selected UUID and requests related records separately. It shows available metadata, source attribution, original link, source tags, research/video fields and current AI output. Scores and source evidence expand on demand, following the approved design. Loaded detail records reading activity. Missing data and pending/failed/skipped AI states need explicit presentation. Opening an original source sends the reader to the publisher; it is not full-text hosting.

### Q84 How does bookmarking work

Bookmarks persist content IDs in this browser, with new saves capped at 200. The UI commits state only after a successful storage write and reports failure if storage is blocked/full. Saved retrieves current records by those IDs, including grouped handling for older larger lists. It does not store a full offline article. If site data is cleared, IDs are lost; if content is unavailable, the interface needs recovery behavior.

### Q85 How does reading history work

Successfully opened details enter a list of up to 200 unique IDs with timestamps. Reopening moves the item to the front. History can be revisited and cleared, and IDs contribute a read penalty in For You. It does not measure reading duration, comprehension, completion or detailed behavior. A failed detail request should not count as a successful read.

### Q86 How are preferences saved

Readers choose controlled topics and content formats. Editing uses a draft; Save commits, Cancel discards edits and Reset clears the draft until saved. Utility validation normalizes unknown/duplicate stored values. Failed writes do not silently replace committed preferences. Preferences affect recommendations in the same browser; they are not an authenticated server profile.

### Q87 Why do my saved items disappear when I use the deployed URL

localStorage belongs to an origin: scheme, hostname and port. Localhost and the public deployment have separate storage, as do different browsers/devices. The behavior follows the agreed no-registration MVP. Multi-device sync would require a new identity/persistence design and migration path; it is not a missing database bookmark table accidentally overlooked in this phase.

### Q88 Does local storage mean my activity never leaves the browser

No. The app sends selected topics/types and read IDs to the recommendation API. Assistant questions and selected evidence are sent to the configured model provider. External images and opened publisher links also make network requests. Local persistence means the reader profile is stored in the browser, not that every interaction stays on-device. Explain this accurately to a privacy-conscious client.

### Q89 How do you handle stale network responses and errors

The resource hook aborts abandoned requests when dependencies change or the component unmounts and supports retry state. That helps prevent an older filter request overwriting newer results. Screens distinguish loading, empty and error cases. The audit also observed that clearing Dashboard data during polling can unmount its open import form; abort handling alone does not solve background-refresh continuity.

### Q90 How do themes responsive design and accessibility work

Shared CSS variables implement light/dark themes, with local persistence. The shell adapts desktop sidebar and mobile navigation. Reusable semantic controls, labels, focus styles, skip link and reduced-motion behavior support access. Previous checks covered selected keyboard interactions and 320px layouts. Full WCAG certification, all browsers and a fresh complete responsive pass after the latest UI edits are not established. Custom keyboard shortcuts remain an acceptance gap.

## 8 Dashboard APIs and security

### Q91 What can an operator do in Dashboard

Inspect content/format/processing counts, relevance coverage, recent runs and created-record activity. Inspect and enable/disable sources, start ingestion, import metadata and run research backfill. Inspect provider configuration/usage, perform a connection probe, select enrichment batches, pause/resume automatic processing and refresh trends. These call protected backend routes; the browser interface is not itself the security boundary. Provider probes are real generation tasks and can use provider quota.

### Q92 How is Dashboard protected without user registration

Operators supply a shared bearer key checked server-side on every admin request. The configured key stays on the backend; an entered credential is retained in component memory rather than localStorage. The server hashes both values and compares them with a timing-safe operation. Invalid attempts are throttled, while valid authorization is checked first to avoid locking out a correct key. This is a simple operator credential, not users, sessions, roles, MFA or a complete enterprise identity system.

### Q93 What does the Dashboard chart measure

Its daily activity comes from record creation times over the recent window. It is not a count of every fetch, updated item, unique reader or accurate AI decision. Separate run counters explain fetch/insert/skip/failure behavior. Coverage distinguishes AI-confirmed relevant, excluded and unclassified records. Always use the metric's actual definition when presenting a chart.

### Q94 How does the REST API work

All application routes use `/api/v1`. GET reads resources; POST accepts assistant tasks or starts protected work; PATCH changes supported settings/source state. Requests use JSON where applicable. Lists return `data` and `pagination`; failures return a structured `error` with code, message and details. A 202 job response must be followed by status inspection. Original content URLs are data, not API credentials or permission to fetch arbitrary resources.

### Q95 Which endpoints should I remember

Remember `/content`, `/content/:id`, `/search`, `/topics`, `/recommendations/for-you`, `/recommendations/trending`, `/assistant/ask`, `/trends`, `/exports/content.json`, `/health/live` and `/health/ready`, all under `/api/v1`. Admin operations use `/admin/...` after the same prefix, including `/admin/metrics`, `/admin/ingestion/run` and `/admin/ai/enrichment`. Optional server bookmark/preferences/history endpoints shown as designs are intentionally absent.

### Q96 What input validation exists

Zod checks route filters, UUIDs, dates, enum values, bounds, strict task payloads and model output. Express limits JSON bodies to 1 MB. Invalid dates, reversed ranges, unknown fields and malformed IDs can return controlled errors. Database constraints provide another boundary. Validation must happen on the server even when UI fields restrict options, because clients can send requests directly.

### Q97 How are secrets and browser content protected

AI and database keys are server environment values, never intentional Vite public variables. Admin responses use no-store. React renders text rather than upstream HTML. Headers include CSP, nosniff, frame denial and no-referrer; original links use safe new-tab behavior. Reviewed outbound endpoints, disabled redirects and response bounds reduce arbitrary-fetch exposure. These are concrete controls, not a comprehensive penetration-test result or proof that every source/secret path is safe.

### Q98 What rate limiting exists and what is missing

Public non-admin/non-health API traffic is limited per process and socket IP to 120 requests per minute. Invalid admin attempts have a separate bounded in-memory tracker. Provider concurrency permits one active generation. These are short-term resource controls, distinct from the removed daily AI caps. Dedicated assistant fairness/throttling, shared limits across replicas and deployment-aware proxy identity remain improvement areas. JSON parsing currently precedes those admission checks, as noted in the audit.

### Q99 How do errors and logs help troubleshooting

Each request gets an ID and safe structured request logs. Validation returns 400; authorization can return 401; missing records 404; busy/conflict or limits have explicit responses; recognized database outages return 503; unexpected failures return safe 500. Ingestion and AI jobs retain their own run IDs, statuses and error summaries. Provider calls record attempts and available usage. Start from the request/job ID and identify source, database, provider or UI failure without printing credentials.

### Q100 How do you measure and control AI cost

The server records provider/model attempts, available input/output token usage and conservative fallback exposure estimates. A durable call record is created before sending. Caching, unchanged-input reuse, thin-input skips, bounded output and concurrency reduce repeated work. Application spending/daily caps were explicitly removed. Estimates depend on code assumptions and are not provider invoices or newly verified prices. The current generic public limiter does not guarantee a desired monthly bill.

## 9 Deployment testing and delivery

### Q101 How does local Docker startup work

Compose starts PostgreSQL 16 with a persistent volume and a combined app container. The Docker build installs workspace dependencies, generates Prisma Client and builds Vite. Runtime uses Node 22 in the image, runs as the node user and applies migrations before starting Express. The app waits for database health. Host access defaults to loopback 5000 for the app and 55434 for PostgreSQL; containers use the internal postgres service on 5432.

### Q102 How are frontend routes served in production

Express serves the compiled frontend assets. Non-API navigation falls back to `index.html` so React Router can open a detail or search URL directly. Unknown API paths still return JSON 404. Returning the SPA HTML proves the entry point loaded, not that the screen rendered correctly. The deployment audit explicitly separated route HTTP checks from real browser acceptance.

### Q103 What is liveness versus readiness

Liveness answers whether the process is running and can reply. Readiness checks database/migration usability. During a database outage, liveness can remain 200 while readiness and content return 503. That distinction helps operators diagnose a dependency outage rather than misreporting a fully healthy app. Startup also recovers interrupted run states, and shutdown stops timers and closes connections.

### Q104 What tests are included

Backend tests cover normalization, storage, filters, duplicate prevention, adapters, scheduler, provider retries/refusals, enrichment validation/currentness, cited assistant/cache and regressions. Frontend utility tests cover bookmarks, preferences, history and ranking helpers. A separate reliability harness owns a disposable database, observes an actual scheduler tick and exercises outage/recovery. Browser artifacts document selected flows. Build/schema/format checks complement tests; they do not replace behavioral acceptance.

### Q105 Do the tests use real AI and production data

Ordinary integration tests use isolated PostgreSQL and injected/mock provider behavior to exercise failures without paid calls. Separate recorded live checks used real sources/models. The 7 November audit notes an initial false failure caused by inheriting AI-enabled development settings; deterministic test environment settings corrected it. Do not treat a mock retry test as proof of today's provider availability or run destructive recovery tests against the deployed demo database.

### Q106 What are the latest recorded verification results

The 7 November acceptance audit reports 80 backend/database passing results, zero skips, and 23 frontend utility results, plus build/schema and isolated reliability evidence. Earlier 71 API plus 7 DB counts describe a different increment and should not be added to the newer total. The public deployment verification reports eight assertions alongside sampled API flows. Results count test outputs, including nested results where recorded; they are not a count of independently tested features. This guide did not rerun them.

### Q107 What is still needed before saying production ready

Finish relevant-dataset and answer-quality review, reconcile the shortcut requirement, fix/recheck cited UI issues, complete actual deployed desktop/mobile/keyboard workflows and verify protected production operations. Establish host-specific backups, restore procedure, monitoring, proxy/limits and capacity from real configuration. Public HTTPS and successful sample endpoints are useful delivery evidence, but the repo does not establish all of these operational commitments.

### Q108 How would you scale it

First measure query plans, response time, provider waits and candidate quality. Then address the bottleneck: improve search access paths/ranking, use shared job ownership and rate limits before replicas, and separate workers from the web process if needed. A durable queue or semantic retrieval could follow justified demand. These are proposed next steps requiring design work, not implemented infrastructure. The current 1,000-candidate ranking window and one provider slot are explicit limits.

## 10 Engineering problems and interview scenarios

### Q109 What were the most important engineering problems

Different source schemas were handled with adapters and normalization. Repeated refreshes were handled with canonical URLs, fingerprints and uniqueness. Weak evidence was handled with skip rules and scope labels. Unreliable model output was handled with schemas and evidence IDs. Stale generation was handled with input hashes and save-time ownership checks. Provider failure was handled with bounded retries/fallback. Interrupted work was handled with persisted logs and startup recovery. Explain at least one mechanism deeply rather than reciting the list.

### Q110 Describe a concrete recorded bug and its solution

The implementation history records an early enrichment contract that asked the model to write exact quotes. Valid source-based work could fail because of quote length or formatting mismatches. The revised contract gives the model bounded evidence IDs and resolves exact excerpts on the server. Rejected earlier output was not saved. You can explain this as a recorded project correction; only say “I personally debugged it” if that matches your involvement.

### Q111 What happens if the same item arrives twice at once

Each path checks for canonical/fingerprint identity, but both may initially see no row. Database uniqueness decides which insertion can commit. The losing uniqueness error is treated as a skipped duplicate. Transactions prevent partial relationships from that failed insert. This handles specific identities; it does not merge every similarly worded story or coordinate all cross-process background work.

### Q112 What if source text changes while the model is answering enrichment

The job remembers the input hash and its processing ID. At save time it reloads the item. Changed ownership causes discard; a changed input hash causes the old output to be discarded and the item to return to pending. This prevents stale output overwriting newer source state. For the assistant, evidence-sensitive cache keys select different answers for changed retrieved evidence, but that is a separate mechanism from enrichment save-time checks.

### Q113 What if Gemini returns 503 three times

If each failure is temporary and configured guards permit work, the gateway makes the initial Gemini attempt and two retries, waiting between them. It then makes one OpenAI attempt if its key exists. Success is validated and recorded with actual provider/model. Failure remains explicit. A safety refusal does not take this fallback path. Existing saved content can still be read while generation is failing.

### Q114 What if a model cites S99 or fabricates a link

S99 is rejected when it is outside the allowed evidence set. HTTP URLs in generated paragraph text are rejected. The server builds source URLs from its own selected stored records. The task fails rather than displaying unsupported references. A valid S1 reference still requires checking whether the paragraph is actually supported; citation membership is not semantic verification.

### Q115 Why might a relevant item not appear in search or For You

Check environment first: production may have a smaller dataset. Check whether it was ingested, excluded by relevance, filtered by type/topic/date, outside the top 1,000 ranking candidates or on another page. For ordinary search, multiple terms must match a supported field condition. Missing dates affect date filters. Distinguish a retrieval limitation from an AI failure by inspecting stored metadata and the request arguments.

### Q116 Why might a record have no AI summary

It may be pending, currently processing, failed, skipped for thin text or lacking a permitted video transcript, irrelevant, insufficiently supported or invalidated by changed input/prompt. Generation may be disabled or paused. Inspect `ai.status`, currentness, skip reason and processing logs. A source description shown on the card is not necessarily AI output; the UI maps current AI summary first and falls back to publisher description.

### Q117 What if a bookmark appears saved but disappears on reload

Check origin, storage permissions and whether the write succeeded. The implementation commits bookmark state only after storage success and reports errors. Check that the ID still resolves to available database content. Clearing storage, private browsing or another origin can explain missing items. The server does not have an account bookmark copy to restore automatically.

### Q118 How do you know the AI answer is good

Use more than schema success. Check source scope, whether each claim follows from its cited text, missing conflicting evidence, recency, retrieval coverage and whether uncertainty is clear. Keep representative supported and unsupported questions. The code enforces structural contracts and honest insufficiency; human source review and a repeatable quality dataset remain necessary. No measured overall factual-accuracy percentage is established.

### Q119 Why not use embeddings Redis and microservices now

PostgreSQL lexical retrieval, a modular backend and bounded in-process work were sufficient for the implemented MVP path. Each added dependency brings deployment, failure and maintenance responsibilities. The current limitations are documented; an improvement should solve a measured problem. If semantic recall, queue durability or multi-replica throughput becomes required, propose those changes explicitly rather than pretending the infrastructure already exists.

### Q120 How did AI help you build the project

**Say, adapting it to your actual involvement:** “I used AI coding assistance to implement and review parts of the application and prepare tests and documentation. I evaluate the result through code review, runnable checks and real workflows. My responsibility is to understand the requirements, validate the behavior and explain the limitations. I would verify an unfamiliar implementation detail in the code rather than guess.”

Do not claim to have hand-written every line or personally solved every historical incident. Prepare by tracing a real request from screen to API to database, then an enrichment job and a cited assistant answer. Understanding those paths is more useful than memorizing technology names.

### Q121 What would you improve first

Prioritize observed gaps: improve relevant dataset/assistant coverage; fix citation presentation; preserve Dashboard forms during polling; show actual import counters and unavailable video metadata; reconcile required shortcuts; finish fresh deployed browser acceptance. Then profile search and provider latency and add justified short-term assistant fairness. Keep proposed changes separate from shipped behavior, and do not reintroduce spending/daily caps that the user removed.

## 11 Client presentation practice

### Q122 What should I demonstrate in ten minutes

1. Explain the problem in 30 seconds and identify the environment/date being shown.
2. Open Discover, explain source attribution and distinguish source descriptions from AI summaries.
3. Search a verified term such as cooling, then apply type/topic filters and open an actual result.
4. On a currently enriched detail, show summary, insights, abstract/description scope and expandable evidence/scores.
5. Open the original source and explain what NewsDC stores versus what stays with the publisher.
6. Save an item, reload Saved, then show Preferences and explain local persistence and feed boosts.
7. Ask a self-contained question already checked against that environment. Open cited sources and explain the evidence boundary.
8. Show an unsupported query returning insufficient evidence.
9. In protected Dashboard, show current coverage, run logs and provider usage. Trigger work only when appropriate; explain 202 versus completed.
10. End with known gaps and proposed next steps. Restore temporary preferences/bookmarks where appropriate.

### Q123 What figures and claims must I verify just before the demo

Check public URL availability, actual environment, indexed/visible counts, confirmed relevant count, processing state, selected source availability and AI enable/pause state. Open the exact enriched item and run the exact assistant question you plan to use. Check citation links and browser layouts. Do not use a local screenshot to imply production coverage. Do not promise 500 relevant records, universal answer coverage, all video playback, instant generation or complete certification without evidence.

### Q124 How can I practise without memorizing the document

Round one: explain the product and architecture in two minutes. Round two: trace an item from HN/arXiv to PostgreSQL and the detail screen. Round three: explain one failed ingestion, stale enrichment and insufficient assistant answer. Round four: let someone choose any feature and ask “Where is it stored?”, “Which request does it make?”, “What happens on failure?” and “What is the limitation?” Answer aloud, then verify your explanation against the code map.

### Q125 What should I say when I do not know an implementation detail

“I can explain the intended behavior, but I want to verify that implementation detail rather than guess. The relevant module is the ingestion service / assistant retrieval / browser storage utility. I would inspect the request, stored record and tests to confirm it.” Then actually follow that path. Clear boundaries and a sound verification method are more credible than an invented technical answer.

## 12 Original assignment coverage

This section follows both pages of the supplied NewsDC Recruitment Assignment. For each topic, learn the user problem, the implementation path and the boundary you should explain. Suggested technologies and example publishers in the assignment are options, not proof that NewsDC uses or collects from all of them.

### Q126 How does the product address the objective and HackerTube reference

**Problem:** A large mixed discussion/news collection contains irrelevant, repeated and low-value material, making useful information hard to discover.

**Implementation:** NewsDC applies the same broad collection → filtering → organization → recommendation pattern to data center content. It uses reviewed adapters, normalization, URL/fingerprint identity, preliminary metadata rules, AI enrichment and topic/ranking interfaces. The unified model adds research and public video metadata alongside articles and discussions. See Q1 to Q12 and Q26 to Q42.

**Boundary:** It is inspired by the approach described in the assignment, not a verified clone of HackerTube's internals. There is no separate trained spam detector or universal spam-removal guarantee. Deduplication is deterministic; relevance filtering is model-assisted; unclassified records can still be visible. The assignment's 3-to-4-working-day duration is a constraint, not evidence of the actual development time spent.

### Q127 How is every data collection requirement addressed

**Problem:** Sources use different formats, omit fields and repeat stories during refresh.

**Implementation:** HN JSON, Data Center Knowledge RSS, arXiv Atom and HN-discovered YouTube oEmbed metadata map into common records. Available title, description, URL, domain publisher, date, author, source tags and HN points/comment counts are retained. HN discussion URLs and available research DOI/channel links preserve useful source relationships. Optional data is not invented. Manual/scheduled runs, logs, refresh updates, canonical URLs and fingerprints address reliability. See Q26 to Q41.

**Boundary:** Data Center Dynamics, Financial Times, New York Times, technical blogs and GitHub are possible source examples in the assignment; dedicated adapters for all of them are not implemented. An HN item can link to one of these sites without NewsDC running a dedicated feed for it. Related-link metadata is not a general extracted web-link graph; full comment bodies are not collected. Permitted public access is required, and paywall bypass is excluded.

### Q128 What do all fourteen category requirements mean and how are they implemented

**Shared mechanism:** `packages/shared/src/taxonomy.js` supplies the allowed vocabulary. Database category rows and mapping tables persist it. Initial keyword rules and later schema-validated AI output assign items. Topics, feed filters and recommendations reuse the mappings. Configurable here means maintained through the shared code/database configuration, not a demonstrated operator interface for creating arbitrary topics live. Adding a category requires updating validation, mappings and affected prompts/tests.

- **Data Center Infrastructure:** Buildings, servers, racks and supporting facilities. Helps readers find physical infrastructure developments. Initial rules include data center/server/rack terms.
- **AI Compute and GPUs:** Accelerators and compute infrastructure. Helps readers follow hardware and capacity. Initial rules include GPU, NVIDIA, compute and accelerator.
- **Power and Energy:** Electricity supply, grid constraints and energy systems. Helps readers understand capacity and operating constraints. Rules include power, energy, electric and grid.
- **Cooling:** Heat removal and thermal systems. Helps readers find liquid cooling and thermal engineering content. Rules include cooling, coolant, liquid and thermal.
- **Sustainability:** Resource efficiency, PUE, WUE and carbon. PUE compares total facility energy with IT equipment energy; WUE concerns water use relative to IT energy, with scope/units requiring care. NewsDC classifies source material about these topics; it does not measure a facility's PUE/WUE or calculate certified sustainability scores.
- **Hyperscaler Investments:** Expansion and spending by large cloud/platform companies. Helps readers follow capital commitments. Rules include hyperscaler and selected company/investment terms; a company keyword alone is not proof of a confirmed investment.
- **Economics and Financial Models:** Costs, finance and business economics. Helps readers assess commercial context. Rules include cost, finance, economics and billion; the app does not implement an investment valuation calculator.
- **Site Selection:** Locations, land and siting constraints. Helps readers track where facilities might be built. Rules include location and site selection; the app is not a geographic optimization engine.
- **Networking:** Interconnects and communication infrastructure. Helps readers find Ethernet, InfiniBand and related developments. Initial rules match networking/interconnect terms.
- **Optimization:** Utilization and efficiency improvements. Helps readers find operational techniques. Keyword classification is distinct from verified evidence that a particular optimization works.
- **AI and Agentic AI:** AI systems/workflows relevant to the ecosystem. Initial rules include agentic and artificial intelligence. This category does not mean the NewsDC backend uses autonomous agents for every task.
- **Security:** Cybersecurity and threats. Helps readers discover security developments. Classification is content organization, not a security scanner or certification of the linked material.
- **Regulation:** Policy, permits and legal constraints. Helps readers find regulatory reporting. NewsDC does not provide legal advice or guarantee current laws through classification.
- **Emerging Technologies:** Newer approaches such as photonics or quantum-related developments. Helps surface innovation-related material. This is a configured category, not automatic creation of new taxonomy concepts.

These keyword examples explain initial behavior. AI categories require enough source evidence and must stay within the allowed vocabulary. Every topic need not have an equally large or fully reviewed dataset.

### Q129 How is the assignment AI filtering requirement implemented

**Problem:** Readers need to separate useful domain content from irrelevant or weak material and understand its significance quickly.

**Implementation:** Sufficient-text checks precede structured AI enrichment. Accepted output contains domain relevance/confidence, controlled categories, intelligence type, summary, insights, relevance/quality estimates and supporting evidence. Public listings exclude records explicitly marked irrelevant. Topic-window reports provide bounded emerging-theme summaries. See Q42 to Q58 and Q76.

**Boundary:** Duplicate prevention is not delegated to an LLM. There is no separate comprehensive spam classifier. A quality score is an estimate, not an automatic guarantee that all low-value records have been removed. Unclassified and thin-source records require honest status labels and further review. General news, technical research, investment intelligence and engineering ideas are distinct from the four content formats.

### Q130 How is every recommendation requirement addressed

**Problem:** A searchable library alone still leaves readers choosing among many items.

**Implementation:** Trending combines freshness, available engagement and current AI scores. For You adds validated local topic/format preferences and read penalties. Topics provides category feeds. Related content uses shared topics. “Most relevant” can mean explicit search-relevance ordering or stored domain relevance ordering depending on query context; these are separate signals. See Q69 to Q78.

**Boundary:** Topic preferences are boosts rather than an exclusive wall, allowing exposure to other configured subjects. That is not a separately implemented exploration/diversity algorithm or automatic new-topic discovery. The assignment's explicit new-topic discovery requirement remains only partially demonstrated. No user registration is needed; local browser state supplies personalization inputs.

### Q131 How is every interface requirement addressed

**Problem:** Readers need a coherent way to discover, understand and revisit content, while operators need visibility into collection health.

**Implementation:** Home/Discover, Trending, Topics, Content Detail, Search, Saved and Dashboard are present, with extra Preferences, History and Ask AI routes. Shared cards show source attribution; enriched details show summaries and insights. Topic/type and other supported filters, pagination, local saving, themes and responsive layouts support navigation. See Q80 to Q93.

**Boundary:** The original discussion link can be preserved in metadata and related items can include discussions, but a dedicated related-discussions workflow is not separately demonstrated. Custom keyboard shortcuts are missing despite being requested by the assignment. Normal Tab/Enter/Space access is different from shortcuts. Full recent browser/accessibility acceptance remains outstanding; backend route success cannot certify UI rendering.

### Q132 How should I explain the five required assistant example questions

**Shared implementation:** All use the same indexed retrieval, optional filters, bounded source evidence, structured generation and validated links described in Q59 to Q68. They are acceptance prompts, not five hardcoded answers.

1. **Latest AI data center infrastructure:** Tests domain/AI retrieval, recency and synthesis. A source-linked answer was recorded in the local audit, but “latest” needs an explicit date scope and source inspection; lexical matching can favor older papers.
2. **Which hyperscalers are investing:** Tests company/investment retrieval and whether sources substantiate actual expansion. A cited answer was recorded locally. The app must not turn a company keyword or research proposal into a confirmed investment announcement.
3. **Liquid cooling and power availability:** Tests cross-topic retrieval and evidence synthesis. Supported answers were recorded locally and a cooling/power question also succeeded in the deployment audit. Each environment still needs its own coverage check.
4. **GPU utilization optimization:** Tests whether available articles actually describe optimization techniques. The 7 November local sample returned insufficient evidence; the safe response is implemented, but successful coverage of this example is incomplete.
5. **Technologies improving PUE and WUE:** Tests combined energy/water evidence and scope-sensitive interpretation. The local sample lacked sufficient evidence. Do not fill the gap with general model knowledge and label it collected-content research.

The assignment's Algolia reference link illustrates a reference experience. It is not evidence that the app searches an llmwiki collection or imports that result set.

### Q133 How does the chosen stack meet technical expectations

**Problem:** The prototype needs maintainable modules, searchable persistent data and a deployable UI/API without excessive infrastructure.

**Implementation:** React/Vite, Node/Express, PostgreSQL/Prisma, server-side hosted-model calls and Docker meet the assignment's permitted choices. PostgreSQL full-text retrieval implements the initial search path. AI modules are separable from the frontend in backend code, even though deployed within one modular monolith. See Q4 to Q8, Q16, Q24 and Q101.

**Boundary:** Next.js, FastAPI, SQLite, Claude, Qwen, Ollama and LangGraph are suggestions in the PDF, not required dependencies or current implementations. Equivalent bounded JavaScript workflows provide orchestration here. Do not describe the code as using LangGraph just because the assignment lists it.

### Q134 How do I demonstrate AI coding and agent requirements honestly

**Problem:** The client wants evidence that AI accelerates delivery while the candidate can own and verify the result.

**Implementation evidence:** The code implements automated collection/classification/summarization services; test suites and dated implementation/audit records document reviews and verification. Git, change history, source modules and logs provide inspectable engineering artifacts. AI-assisted coding is distinct from runtime model processing. The runtime ingestion adapters are deterministic services, not an LLM independently choosing websites.

**Prepare your own contribution record:** For each significant task, say what the coding assistant proposed or wrote, what you reviewed, which commands/checks actually ran, what browser/source review you personally performed and what remains uncertain. Do not infer personal contribution from a generated log. Repository existence alone does not prove the remote repository is accessible or the exact release commit; verify these deliverables before presenting. See Q10, Q104 to Q106 and Q120.

### Q135 How do deployment security and optional performance expectations map

**Problem:** A local screenshot is insufficient delivery, and public APIs/AI keys need operational protection.

**Implementation:** Docker packaging, startup migrations, server environment secrets, protected admin endpoints, validation, safe errors, structured logs, browser headers, public throttling and generation guards are present. A public HTTPS deployment was sampled on 7 November. Setup/deployment references and bounded pagination/caches provide initial operational/performance measures. See Q91 to Q108.

**Boundary:** The audit did not inspect every production admin workflow, host backup configuration, load capacity or full browser UI. Do not infer AWS/VPS ownership from the PDF's examples. The recorded URL identifies the tested deployment; it does not prove today's uptime or a production SLA. Query-plan and load evidence are needed for stronger performance claims.

### Q136 What is the status of every requested deliverable

- **Deployed app and URL:** Public endpoint and sampled flows recorded in the 7 November deployment audit. Recheck before the interview.
- **Git source repository:** Local Git source exists. Verify remote URL, access permissions and release commit separately.
- **Architecture diagram and workflow:** Mermaid architecture/AI diagrams and flow descriptions exist in system/AI documentation. Q7 explains their runtime meaning. Some older design text is historical and must be reconciled with current modules.
- **Model and prompt configuration:** Provider config and task instructions/schemas exist in backend AI files. Q44 and Q50 explain them; do not display real environment values.
- **At least 500 relevant records where permitted:** Not established by the latest recorded audit. 736 total local records and 176 confirmed relevant at a snapshot are different measures; production was smaller.
- **AI filtering categorization and recommendations:** Implemented paths and selected tests/live checks exist. Dataset-wide semantic correctness remains a separate acceptance exercise.
- **JSON and Markdown exports:** Implemented with a 100-record bound; contents differ by format as explained in Q79.
- **README and technical documentation:** Files exist, but the audit identifies stale phase/deployment statements. Use newer dated evidence for the presentation; documentation existence is not perfect accuracy.
- **Final presentation:** This manual and the demo sequence support preparation. The candidate must still demonstrate the actual app and explain choices, AI usage, challenges and proposed improvements.

### Q137 What does satisfying the success criteria actually require

The end-to-end product should collect permitted sources, filter/classify evidence, organize it, recommend it and support cited questions in a deployable application. The implementation demonstrates substantial parts of that flow. Final acceptance additionally requires the requested keyboard shortcuts or an explicitly agreed scope resolution, sufficient relevant-data/answer coverage, resolved UI issues and completed live browser verification. The success criterion values a sound working slice over feature count; a long feature list is not a substitute for a reliable demonstration.

### Q138 How do I answer any assignment topic in a structured way

Use four sentences: “The user problem is ... . We implemented it through ... . A concrete example is ... . The current limitation is ... .”

For example: “Repeated feed refreshes could inflate the library. We normalize URLs, fingerprint title/domain and enforce database uniqueness. The same story with a tracking parameter refreshes an existing item rather than adding another. This does not merge all semantically similar reporting across publishers.” Apply the same structure to every topic above, then point to the corresponding code or dated evidence.

## 13 Plain language glossary

- **API:** The HTTP interface the browser or another program uses to ask the backend for data or work.
- **Backend:** Server code that validates requests, queries data and calls sources/providers.
- **Frontend:** The browser interface built from React components.
- **SPA:** A single-page application whose browser router changes screens after the entry point loads.
- **RSS and Atom:** XML feed formats used to publish structured lists of content metadata.
- **Metadata:** Descriptive fields such as title, URL, author and date, rather than the full underlying article/video.
- **ORM:** A library such as Prisma that expresses database operations as structured program calls.
- **Schema:** A description of allowed structure, whether database tables or a validated request/response.
- **Migration:** A versioned database structure change.
- **Transaction:** A group of database updates committed or rolled back together.
- **Foreign key:** A database rule connecting one record to an existing referenced record.
- **Index:** A database access structure that can speed matching queries while adding storage/write cost.
- **GIN:** A PostgreSQL index type useful for matching sets of searchable terms, among other uses.
- **Canonical URL:** A normalized URL used for conservative identity matching.
- **Hash and fingerprint:** Deterministic digests used here to identify normalized content or input changes; hashing is not encryption.
- **Idempotency:** Repeating a defined operation without creating unintended repeated effects, such as duplicate records.
- **LLM:** A hosted language model used here for structured analysis and synthesis.
- **Token:** A model input/output unit used in provider limits and usage accounting; it is not exactly one word.
- **Prompt:** Instructions and input sent to the model.
- **RAG:** Retrieval-augmented generation, using retrieved evidence to inform the answer.
- **Embedding:** A numerical text representation for semantic similarity; future scope here.
- **Cache:** Saved output reused when its identity and expiry permit.
- **Backoff:** Waiting between retries to avoid immediately repeating a temporary failure.
- **Concurrency guard:** A limit on simultaneous work, currently process-local in key NewsDC paths.
- **Provenance:** Where evidence/output came from and which model, input scope and version produced it.
- **localStorage:** Browser storage scoped to an origin, used for local reader state.
- **CSP:** Browser policy restricting where scripts, connections and other resources may come from.
- **SSRF:** A server being induced to fetch unintended resources; reviewed fixed endpoints reduce this exposure.
- **SLA:** A service commitment; no sustained uptime or latency guarantee is demonstrated by the recorded samples.

## 14 Code and evidence map

All paths below are relative to the NewsDC repository. Use them to verify an answer or prepare a code walkthrough.

- Product/scope: `docs/PRD.md`, `docs/MVP_SCOPE.md`, `docs/FEATURES.md`, `docs/TRACEABILITY.md`.
- Architecture/contracts: `docs/SYSTEM_DESIGN.md`, `docs/DATABASE_DESIGN.md`, `docs/API_SPEC.md`, `docs/AI_WORKFLOW.md`.
- Approved interface: `docs/DESIGN_SYSTEM.md`, `docs/UI_UX_SPEC.md`.
- Current acceptance evidence: `docs/ACCEPTANCE_AUDIT_2026-11-07.md`, `docs/DEPLOYED_ACCEPTANCE_2026-11-07.md`, and their referenced `artifacts` JSON files.
- Assignment baseline: the two-page `NewsDC_Recruitment_Assignment v1.0 (1).pdf` supplied from the user's Downloads folder; section 12 maps its objective, reference approach, requirements 3 to 10, deliverables and success criteria.
- Historical increments and recorded corrections: `docs/IMPLEMENTATION_STATUS.md`, `docs/IMPLEMENTATION_HISTORY.md`.
- Source registry, request bounds and adapters: `services/api/src/ingestion/sources.js`.
- YouTube metadata: `services/api/src/ingestion/video.js`.
- Validation, canonicalization, fingerprint and initial topic rules: `services/api/src/ingestion/normalize.js`.
- Item persistence, duplicate refresh and ingestion runs: `services/api/src/ingestion/service.js`.
- Scheduled refresh and backfill: `services/api/src/ingestion/scheduler.js`, `services/api/src/ingestion/backfill.js`.
- Data tables and relationships: `packages/db/prisma/schema.prisma`; database changes: `database/migrations/001_foundation.sql` through `006_ai_cache_settings.sql`.
- Migration runner and database client: `packages/db/src/migrations.js`, `packages/db/src/index.js`.
- Filters, full-text queries, ranking, pagination and serialization: `services/api/src/content/service.js`.
- API routes and operator authorization: `services/api/src/routes.js`.
- HTTP middleware, health, static serving and errors: `services/api/src/app.js`; public limiter: `services/api/src/security.js`.
- Runtime wiring and startup: `services/api/src/runtime.js`, `services/api/src/server.js`.
- AI model values, provider HTTP calls, retries/fallback: `services/api/src/ai/providers.js`; accounting/errors: `services/api/src/ai/limits.js`.
- Evidence scope, eligibility, input hashes and currentness: `services/api/src/ai/enrichment-input.js`.
- Enrichment schema/evidence validation: `services/api/src/ai/enrichment-contract.js`; jobs/persistence/recovery: `services/api/src/ai/enrichment.js`.
- Background AI loop and persisted pause: `services/api/src/ai/automation.js`.
- Assistant request, retrieval, citations and cache: `services/api/src/ai/assistant.js`.
- Topic windows, cited reports and trend cache: `services/api/src/ai/trends.js`.
- Topic vocabulary: `packages/shared/src/taxonomy.js`.
- Browser routes and shared state: `apps/web/src/app/routes.jsx`, `apps/web/src/context/NewsContext.jsx`.
- Fetch wrapper and record-to-card mapping: `apps/web/src/services/api.js`; resource lifecycle: `apps/web/src/hooks/useResource.js`.
- Reader persistence: `apps/web/src/utils/bookmarks.js`, `preferences.js`, `readingHistory.js`, and their hooks/tests.
- Screens: `apps/web/src/pages/Discover.jsx`, `Trending.jsx`, `Topics.jsx`, `Search.jsx`, `ContentDetail.jsx`, `Saved.jsx`, `ReadingHistory.jsx`, `Preferences.jsx`, `AskAI.jsx`, `Dashboard.jsx`.
- UI reuse and AI detail: `apps/web/src/components/content`; protected operator panels: `apps/web/src/components/admin`; theme/responsiveness: `apps/web/src/styles/global.css`.
- Packaging and settings: `Dockerfile`, `docker-compose.yml`, `.env.example`. Never display real `.env` values in a presentation.
- Verification commands/contracts: root `package.json`, `services/api/test`, `packages/db/test`, `apps/web/src/utils/*.test.js`, `scripts/smoke.mjs`, `scripts/verify-reliability.mjs`.

This guide supports the PRD's final-presentation/documentation goal and F37/F38. It adds preparation material only; it changes no application scope, dependency or runtime behavior. Treat dated audit counts as historical evidence and check the deployed application before making present-tense commitments.

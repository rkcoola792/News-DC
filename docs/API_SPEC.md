# REST API Specification — NewsDC

> Current implementation update — 6 November 2026: cited assistant, automatic enrichment, cached/source-linked trends, research backfill and approved YouTube public metadata are implemented. See [ASSISTANT_AUTOMATION.md](ASSISTANT_AUTOMATION.md) for current contracts/evidence; older pending/deferral notes below are historical. Full user acceptance, relevance dataset review and public deployment remain open.

Base path: `/api/v1`  
Format: JSON  
Authentication: no end-user registration for MVP. Administrative endpoints must be protected by a server-side admin secret or deployment access control. Never expose that secret in the browser.

Research adapter update (6 November 2026): existing content/search/detail/export contracts now serve live arXiv records with `contentType: "RESEARCH"`, author, source abstract, tags and original HTTPS abstract link. `metadata` includes `arxivId`, `authors`, available `doi`/`journalReference`, `updatedAt`, `primaryCategory` and `descriptionOrigin: "source-abstract"`. Existing protected source/run endpoints manage source `10000000-0000-4000-8000-000000000003`. No new endpoint or AI call is required; absent optional fields remain null. See RESEARCH_INGESTION.md.

## 1. Conventions

### AI provider routing

Backend-only environment names: GEMINI_API_KEY, OPENAI_API_KEY and AI_PROVIDER_ENABLED. Keys remain in root gitignored .env or deployment secrets, never in URLs, API bodies or VITE_ variables. Operator authentication protects GET /admin/ai/providers (safe configuration/usage) and POST /admin/ai/providers/check with an empty JSON object (fixed connection probe). Gemini is primary with two temporary-failure retries, then one OpenAI fallback. Permanent errors skip futile retries; safety refusals do not fall back. No application spending/daily cap is configured. Unknown fields/prompts are rejected. The shared gateway serves operator checks, enrichment, cited assistant and trend synthesis. See AI_PROVIDER_ROUTING.md for contracts and evidence.

### Pagination

Query parameters:

- `page` (default 1, min 1)
- `limit` (default 20, max 100)
- `sort` (endpoint-supported values only)
- `order` (`asc` or `desc`)

Response shape:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

### Error shape

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "A human-readable explanation",
    "details": []
  }
}
```

## 2. Content

| Method | Endpoint               | Purpose                                  |
| ------ | ---------------------- | ---------------------------------------- |
| GET    | `/content`             | List content with filters and pagination |
| GET    | `/content/:id`         | Content detail                           |
| GET    | `/content/:id/related` | Related content                          |
| GET    | `/content/:id/summary` | AI summary and insights                  |
| GET    | `/content/types`       | Available content types                  |

`GET /content` query:

- `q`: keyword search
- `type`: ARTICLE, VIDEO, RESEARCH, DISCUSSION
- `category`: category slug
- `publisher`: publisher ID/domain
- `from`, `to`: ISO date boundaries
- `minRelevance`, `minQuality`: numeric 0–100
- `sort`: `publishedAt`, `relevance`, `quality`
- `page`, `limit`

Example response item:

```json
{
  "id": "uuid",
  "contentType": "ARTICLE",
  "title": "Example title",
  "description": "Publisher description",
  "url": "https://publisher.example/story",
  "publisher": { "id": "uuid", "name": "Example Publisher" },
  "publishedAt": "2026-01-01T10:00:00Z",
  "categories": [{ "slug": "cooling", "name": "Cooling" }],
  "ai": {
    "status": "COMPLETED",
    "summary": "AI-generated summary",
    "keyInsights": ["Insight one"],
    "relevanceScore": 90,
    "qualityScore": 82
  }
}
```

## 3. Discovery

| Method | Endpoint                    | Purpose               |
| ------ | --------------------------- | --------------------- |
| GET    | `/recommendations/for-you`  | Personalized feed     |
| GET    | `/recommendations/trending` | Trending feed         |
| GET    | `/topics`                   | Topic list and counts |
| GET    | `/topics/:slug/content`     | Topic feed            |

ForYou accepts a preference payload in the request body only if implemented as POST; otherwise pass compact preference IDs as query parameters. Do not trust arbitrary client scores. The server calculates ranking from validated topic/type preferences and stored signals.

Example:
`GET /recommendations/for-you?topics=cooling,ai-compute-gpus&types=ARTICLE,VIDEO&page=1&limit=20`

## 4. Search

| Method | Endpoint  | Purpose                         |
| ------ | --------- | ------------------------------- |
| GET    | `/search` | Full-text search across content |

Query parameters mirror `/content` filters. Return content type, publisher, publication date, excerpt and URL. Use Prisma full-text search; no handwritten application SQL.

## 5. Assistant

| Method | Endpoint         | Purpose                             |
| ------ | ---------------- | ----------------------------------- |
| POST   | `/assistant/ask` | Ask a question over indexed content |

Request:

```json
{
  "question": "What are recent developments in liquid cooling?",
  "filters": {
    "contentTypes": ["ARTICLE", "RESEARCH"],
    "categorySlugs": ["cooling"],
    "dateFrom": "2025-01-01"
  }
}
```

Response:

```json
{
  "answer": "Based on the indexed sources ...",
  "sources": [
    {
      "contentId": "uuid",
      "title": "Source title",
      "url": "https://source.example/item",
      "publisher": "Publisher",
      "publishedAt": "2026-01-01T10:00:00Z"
    }
  ],
  "retrieval": {
    "count": 3,
    "method": "postgres_full_text"
  }
}
```

Rules:

- Return citations only for records actually retrieved.
- If retrieval returns no useful evidence, say so.
- Limit question length and retrieved context size.
- Do not accept arbitrary client-supplied source text as trusted evidence.

## 6. Local-first user features

These can initially be implemented entirely in local storage. If API persistence is required later, add anonymous session-scoped endpoints.

| Method | Endpoint                | Purpose                          |
| ------ | ----------------------- | -------------------------------- |
| GET    | `/bookmarks`            | Optional server-synced bookmarks |
| PUT    | `/bookmarks/:contentId` | Optional save/upsert             |
| DELETE | `/bookmarks/:contentId` | Optional remove                  |
| GET    | `/preferences`          | Optional preference sync         |
| PUT    | `/preferences`          | Optional preference update       |
| POST   | `/history`              | Optional reading event           |
| GET    | `/history`              | Optional reading history         |

Do not implement these endpoints unless server synchronization is actually needed for the MVP.

## 7. Ingestion and operations (admin protected)

| Method | Endpoint                       | Purpose                        |
| ------ | ------------------------------ | ------------------------------ |
| POST   | `/admin/ingestion/run`         | Trigger ingestion              |
| GET    | `/admin/ingestion/runs`        | List ingestion runs            |
| GET    | `/admin/ingestion/runs/:id`    | Run details                    |
| GET    | `/admin/metrics`               | Content and processing metrics |
| POST   | `/admin/content/:id/reprocess` | Retry AI enrichment            |

Example trigger:

```json
{ "sourceIds": ["uuid"], "reason": "manual-demo" }
```

Return `202 Accepted` when work is queued, with a job/run identifier.

## 8. Export

| Method | Endpoint                | Purpose         |
| ------ | ----------------------- | --------------- |
| GET    | `/exports/content.json` | JSON export     |
| GET    | `/exports/content.md`   | Markdown export |

Allow filters and enforce export limits. Preserve original source URLs and attribution.

## 9. HTTP status guidance

- `200` successful read/update
- `201` created resource
- `202` accepted asynchronous job
- `204` successful delete with no body
- `400` invalid request
- `401` missing/invalid admin authentication
- `403` not permitted
- `404` not found
- `409` conflict/duplicate where relevant
- `422` semantically invalid payload
- `429` rate limited
- `500` unexpected server error
- `502` upstream provider failure
- `503` temporarily unavailable

## 10. Implementation notes

- Validate query/body with a schema validator (e.g. Zod or Joi).
- Use parameterized database queries.
- Keep controllers thin; business logic belongs in services.
- Add request IDs and structured error logging.
- Document actual implemented endpoints in OpenAPI/Swagger if time permits.

## 11. Current implementation coverage — 6 November 2026

Implemented: health/live and health/ready; content/types, content list/detail/summary status/related; search; ForYou/Trending; topics/topic content; publishers; JSON/Markdown exports; protected source listing/toggle, ingestion run/inspect, metrics and metadata import. Paths use the `/api/v1` prefix. Source toggling uses PATCH `/admin/sources/:id`; imports use POST `/admin/content/import`.

Assistant POST returns 503 AI_DISABLED only when AI_PROVIDER_ENABLED is false. Cited responses, insufficient-evidence behavior and cache contracts are documented in ASSISTANT_AUTOMATION.md. Persisted summary status and protected enrichment/retry controls are implemented. Optional server bookmark/preferences/history endpoints are deliberately absent because those features are browser-local.

Health and errors include request IDs; unknown paths return JSON 404. Content endpoints return stored source metadata using Prisma. Source tags and full AI enrichment are not complete; see the feature tracker. Exports cap matching records at 100. No unprotected admin write controls exist.

## Source tags (F2)

Metadata imports accept optional `tags: string[]`. Content list/detail and JSON exports include `tags: [{id,name}]`. Labels are normalized and deduplicated. Omission preserves existing relationships on refresh, an explicit empty array clears them, and malformed tags reject the candidate. See [F2_TAGS.md](F2_TAGS.md) for limits and semantics.

## Operator enrichment API — 6 November 2026

GET /api/v1/admin/ai/enrichment returns enabled/busy, 50 recent candidates with eligibility/cache state, and 30 persistent processing logs. POST at the same path accepts a strict object with unique contentIds UUID array (1–10) and returns 202/runIds. Existing operator bearer authentication applies. Missing records return 404, concurrent batch 409, disabled generation 503. Unsupported prompts/extra fields reject; no arbitrary public generation endpoint is added.

Existing content/summary/detail/export DTO ai now exposes currentness, summary/insights, classification, relevance/confidence/quality, explanations, provider/model/date, evidence scope and original supporting excerpts. Non-current generated values are withheld. /content/:id/summary enabled indicates whether new generation is enabled; saved current output can still be read with generation disabled. Search includes saved summaries; lists/related/topic counts exclude classified irrelevant items. Current stored AI scores contribute to ForYou/Trending; unprocessed records use existing signals.

Provider routing remains Gemini first, two temporary retries, then OpenAI fallback, with no application spending/daily caps. Assistant/ask uses filtered Prisma retrieval, validated citations and saved answer reuse. See CONTENT_ENRICHMENT.md for evidence/hash/logging semantics and data limitations.

## Assistant/automation implementation contract — 6 November

See ASSISTANT_AUTOMATION.md for GET /assistant/status, POST /assistant/ask, GET /trends and protected automation/backfill/report routes. Assistant responses also include paragraphs/contentIds, source text scope/content type, insufficientEvidence, limitations, provider/model/cached and retrieval terms. GET requests do not generate output. Migration 006 persists AI caches and operator settings.

## Assistant SSE response option — 10 November 2026

POST `/assistant/ask` additionally accepts header `Accept: text/event-stream`. Body and validated answer payload are unchanged. SSE events are `status` with `{ "message": "..." }`, `answer` containing the existing complete validated payload, `done` with `{}`, or `error` with safe code/message. HTTP validation failures before headers remain JSON. Consumers must see `done` before treating a response as complete. No provider tokens are exposed before output/citation validation. The UI progressively reveals the validated answer; plain JSON clients are unchanged. See ASSISTANT_AUTOMATION.md for timing, caching and Stop behavior.

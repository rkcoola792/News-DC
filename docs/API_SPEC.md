# REST API Specification — NewsDC

Base path: `/api/v1`  
Format: JSON  
Authentication: no end-user registration for MVP. Administrative endpoints must be protected by a server-side admin secret or deployment access control. Never expose that secret in the browser.

## 1. Conventions

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

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/content` | List content with filters and pagination |
| GET | `/content/:id` | Content detail |
| GET | `/content/:id/related` | Related content |
| GET | `/content/:id/summary` | AI summary and insights |
| GET | `/content/types` | Available content types |

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

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/recommendations/for-you` | Personalized feed |
| GET | `/recommendations/trending` | Trending feed |
| GET | `/topics` | Topic list and counts |
| GET | `/topics/:slug/content` | Topic feed |

ForYou accepts a preference payload in the request body only if implemented as POST; otherwise pass compact preference IDs as query parameters. Do not trust arbitrary client scores. The server calculates ranking from validated topic/type preferences and stored signals.

Example:
`GET /recommendations/for-you?topics=cooling,ai-compute-gpus&types=ARTICLE,VIDEO&page=1&limit=20`

## 4. Search

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/search` | Full-text search across content |

Query parameters mirror `/content` filters. Return content type, publisher, publication date, excerpt and URL. Use parameterized SQL.

## 5. Assistant

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/assistant/ask` | Ask a question over indexed content |

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

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/bookmarks` | Optional server-synced bookmarks |
| PUT | `/bookmarks/:contentId` | Optional save/upsert |
| DELETE | `/bookmarks/:contentId` | Optional remove |
| GET | `/preferences` | Optional preference sync |
| PUT | `/preferences` | Optional preference update |
| POST | `/history` | Optional reading event |
| GET | `/history` | Optional reading history |

Do not implement these endpoints unless server synchronization is actually needed for the MVP.

## 7. Ingestion and operations (admin protected)

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/admin/ingestion/run` | Trigger ingestion |
| GET | `/admin/ingestion/runs` | List ingestion runs |
| GET | `/admin/ingestion/runs/:id` | Run details |
| GET | `/admin/metrics` | Content and processing metrics |
| POST | `/admin/content/:id/reprocess` | Retry AI enrichment |

Example trigger:
```json
{ "sourceIds": ["uuid"], "reason": "manual-demo" }
```

Return `202 Accepted` when work is queued, with a job/run identifier.

## 8. Export

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/exports/content.json` | JSON export |
| GET | `/exports/content.md` | Markdown export |

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

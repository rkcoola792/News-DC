# Testing Strategy and Acceptance Checklist

## Current evidence — 6 November 2026

Latest full suite (5 November): 23 frontend logic + 7 DB + 22 API/ingestion = 52 passing test results with PostgreSQL enabled. Fresh `npm run smoke` on 6 November passes with 91 actual records, 8 cooling results, 14 topics, healthy API and protected metrics. Selected browser flows were checked; this is not an exhaustive accessibility/browser acceptance pass.

Sections 5–6 below are earlier verification snapshots and are superseded by the current implementation tracker. Do not interpret earlier unchecked/pending descriptions as current implementation status. Final assignment acceptance is still open, including metadata tags, deferred AI, dataset coverage and public deployment. The plan is [ASSIGNMENT_COMPLETION_PLAN.md](ASSIGNMENT_COMPLETION_PLAN.md).

## 1. Test layers

### Unit tests

- URL canonicalization and fingerprint generation.
- Source adapter normalization.
- Required field validation.
- Category mapping and score normalization.
- Recommendation score calculation.
- AI response schema validation.
- Citation ID validation.

### Integration tests

- API list/detail/search filters against test PostgreSQL.
- Ingestion adapter -> normalization -> deduplication -> persistence.
- AI pipeline with mocked LLM provider.
- Assistant retrieval and citation mapping.
- Export output validity.

### Frontend tests

- Navigation and route rendering.
- Content card displays type, publisher and source.
- Filters update results.
- Bookmark persists in local storage.
- Preferences persist after refresh.
- Assistant displays answer and source references.
- Loading, empty and error states.

### End-to-end smoke tests

- Start app and open ForYou.
- Search for a Data Center topic.
- Filter to videos or articles.
- Open content detail and source link.
- Bookmark and revisit item.
- Ask assistant a question and open a citation.
- Trigger ingestion through protected admin path and inspect run status.

## 2. Critical edge cases

- Missing author, description, publication date or thumbnail.
- Invalid/malformed RSS item.
- Same URL with tracking parameters.
- Same content with different URLs.
- Upstream API timeout/rate limit.
- LLM timeout or malformed JSON.
- LLM returns unknown category.
- Video without transcript.
- No search results.
- Assistant has no supporting retrieved content.
- Pagination page beyond available results.
- Database unavailable.
- Admin endpoint called without authorization.

## 3. Acceptance checklist

- [ ] At least one public API and one RSS source work, where permitted.
- [ ] Metadata normalized into common content model.
- [ ] Duplicate URL is not inserted twice.
- [ ] Irrelevant content is excluded from user discovery feeds.
- [ ] Relevant content has topic labels.
- [ ] Summary and insights are stored for supported text.
- [ ] Failed AI processing is observable and retryable.
- [ ] ForYou and Trending return ordered results.
- [ ] Search supports keyword and content filters.
- [ ] Article/video/research/discussion type is visible.
- [ ] Detail page links to original source.
- [ ] Local bookmarks/preferences/history work.
- [ ] Assistant answers with valid source links.
- [ ] Export produces valid JSON/Markdown (if included).
- [ ] Secrets are not present in client bundle or Git.
- [ ] README setup is tested on a clean environment.
- [ ] Deployment URL is reachable.
- [ ] Manual verification log is complete.

## 4. Verification log template

| Date       | Feature/area  | Test performed         | Result    | Evidence/notes | Verified by |
| ---------- | ------------- | ---------------------- | --------- | -------------- | ----------- |
| YYYY-MM-DD | Ingestion     | Trigger RSS fetch      | PASS/FAIL | Run ID/log     | Manual      |
| YYYY-MM-DD | Deduplication | Re-ingest same URL     | PASS/FAIL | Record count   | Manual      |
| YYYY-MM-DD | AI            | Process sample article | PASS/FAIL | Stored JSON    | Manual      |
| YYYY-MM-DD | Assistant     | Ask topic question     | PASS/FAIL | Citation URLs  | Manual      |

Do not mark a test as passed until it has actually been executed.

## 5. Current executed verification — 5 November 2026

`node --test apps/web/src/utils/*.test.js` passes **23 tests**:

| Area            | Tests | What the executed checks cover                                                                                                                                                                 |
| --------------- | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bookmarks       | 3     | Malformed values, persistence/removal through fresh storage reads, denied reads/failed writes                                                                                                  |
| ForYou preview  | 8     | Preferences change order, format/topic boosts, unread ties, defaults, deterministic non-mutating ranking, combined filters, title override, unchanged other-screen order, reloaded preferences |
| Preferences     | 7     | Full taxonomy IDs, defaults, malformed values, validated persistence, isolated drafts, reset/save, failed writes                                                                               |
| Reading history | 5     | Reopen ordering/deduplication, malformed data, cap, fresh read/clear, failure reporting                                                                                                        |

These are Node.js logic tests using in-memory storage adapters. They do not verify rendering, actual localStorage reloads, responsive appearance, or keyboard behavior. The last browser preview attempt timed out; browser acceptance items above remain unchecked.

Production compilation and Prettier checks have passed in prior implementation turns. This documentation reconciliation reruns the logic suite and formatting check; it does not claim new browser or deployment evidence.

### Next verification targets

- Browser: preference Save/Cancel/Reset/reload, bookmark save/remove/reload and failed-save feedback, history revisit/clear, personalization/filter/sort interactions, light/dark contrast, keyboard and 320px layout.
- F39 foundation: apply migrations on a test PostgreSQL database, check constraints/taxonomy, round-trip all four formats, and verify API/database health and unavailable-database errors.
- F2/F5/F3 follow-up: reject invalid required metadata while allowing missing optional fields; preserve original URLs; repeated canonical URLs cannot create duplicate records; fingerprint behavior is documented and tested.

## 6. Backend foundation verification — 5 November 2026

Executed against a temporary PostgreSQL 16 container on loopback port 55432 with an explicitly configured `TEST_DATABASE_URL`:

- `npm run test:db`: 7 passing test results; no skips. Includes real migration/repeat-run, taxonomy, four-format round-trip, constraints and search-vector update checks.
- `npm run test:api`: 6 passing HTTP tests; no skips. Includes real readiness after migration, injected unavailable/missing-migration behavior, liveness, safe errors, request IDs and unknown endpoints.
- Existing frontend suite: 23 pass. Production build passes.

Default API/DB commands explicitly skip their real PostgreSQL tests when `TEST_DATABASE_URL` is absent. API integration applies migrations in the dedicated test database public schema; DB integration uses a temporary schema, then drops only that generated schema. Use a disposable test database, never production. Mocked readiness tests alone are not PostgreSQL evidence.

F39 foundation acceptance is verified. Ingestion, AI, consumer content/search APIs, browser acceptance and full container delivery remain unchecked. A canonical unique constraint is verified; automatic canonicalization/fingerprint processing is not yet implemented.

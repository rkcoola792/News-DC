# Testing Strategy and Acceptance Checklist

## Current evidence — 6 November 2026

Latest API/provider suite (6 November): **48 passing results**, PostgreSQL enabled, no skips. Same-day DB/frontend suites before these fixes passed 7/23 results. The explicit `npm run test:reliability` check also passed a real 60-second scheduled interval and isolated database outage/recovery. Current live collection is 141 records (17 cooling search results, 14 topics), with AI disabled. Keyboard search/filter/detail/bookmark workflows and 320px research detail/Topics were inspected; this is not an exhaustive accessibility/browser acceptance pass.

Sections 5–6 below are earlier verification snapshots and are superseded by the current implementation tracker. Do not interpret earlier unchecked/pending descriptions as current implementation status. Tags and automatic research ingestion are complete. Final assignment acceptance remains open for AI, dataset coverage, broader user acceptance and public deployment. The plan is [ASSIGNMENT_COMPLETION_PLAN.md](ASSIGNMENT_COMPLETION_PLAN.md).

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

## Research increment verification — 6 November 2026

The current API/ingestion suite passes **35 results**, no skips, using the disposable PostgreSQL database on loopback 55433. Prior to research changes, DB foundation (7) and frontend logic (23) suites passed on the same date. The earlier sections are historical evidence, not current implementation gaps. Research tests cover Atom metadata, optional fields/legacy IDs, invalid/error/empty feeds, single-connection request spacing after failure, Prisma persistence/tags, research search and repeat deduplication.

Live arXiv ingestion persisted 50 records; repeat inserted 0, skipped 50, failed 0. Development total is 141. Smoke passes readiness/content/topics/protected metrics with AI off (17 cooling matches, 14 topics). Live research-only thermal search/detail verified authors, tags and original link. Docker image and production frontend build pass. See IMPLEMENTATION_STATUS.md for recovery details and remaining manual/scheduler/AI acceptance. No fresh browser audit is claimed for this increment.

## Reliability acceptance update — 6 November 2026

`npm run test:api`: 38 passing results, real isolated PostgreSQL, no skips. `npm run test:reliability`: PASS, real scheduled interval at 60,348 ms, safe source failure, actual isolated database stop/start, ready/content 503 during outage while live stays 200, safe scheduler failure, readiness and persistence/dedup recovery. It uses test-only port 55435 and removes its own container/volumes. The running demo database is not affected.

Browser: keyboard skip/search/filter/detail/bookmark/reload/remove and mobile Topics inspected. Fixed and rechecked topic-label wrapping for multi-topic research detail at 320px; no horizontal overflow observed. Screenshot in artifacts/research-mobile-verified.png. These checks do not establish an exhaustive accessibility/browser matrix. Public deployment and AI end-to-end acceptance remain open; Gemini free-tier planning is in AI_DEMO_PLAN.md.

## Provider routing verification — 6 November 2026

Final cap-removal suites: 48 API + 7 DB results pass, isolated PostgreSQL enabled, no skips. Nine provider tests cover primary success, retry/fallback order, Retry-After, permanent/non-JSON errors, safety refusals, malformed output, disabled/oversized/storage-failure paths, overlap and operator authorization. Real DB integration verifies five migrations, persisted counters beyond the previous $1/50 thresholds, concurrent accounting and idempotent finalization. Provider unit tests were rerun after the final non-JSON error handling fix; all nine pass. Frontend/Docker builds and live smoke passed. Gemini and controlled-failure/real-OpenAI probes succeeded; see AI_PROVIDER_ROUTING.md. No generated summaries or assistant acceptance is claimed.

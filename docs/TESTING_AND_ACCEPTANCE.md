# Testing Strategy and Acceptance Checklist

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

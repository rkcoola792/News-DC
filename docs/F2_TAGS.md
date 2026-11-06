# F2 — source tags

Completed 6 November 2026 under FEATURES.md F2. No AI or schema migration required.

## Import/API contract

Supply optional `tags` as an array of strings, for example:

```json
{
  "title": "Permitted source title",
  "url": "https://publisher.example/story",
  "type": "ARTICLE",
  "tags": ["Cooling", "GPU"]
}
```

Use the protected Dashboard metadata import form with a permitted discovery source. Source/import labels are separate from controlled topic categories.

Tags normalize to cleaned, whitespace-collapsed, Unicode NFC, lowercase labels. Duplicate labels become one tag relationship. Limits are 100 incoming entries, 30 unique labels, and 80 characters per final label. Empty labels, numbers, objects, null and oversized lists/labels are rejected as candidate validation failures.

## Refresh semantics

- Omitted `tags`: preserve existing tags; new records have no tags.
- Nonempty `tags`: replace that record's relationships atomically.
- `tags: []`: clear that record's tag relationships.
- Invalid tags: reject the candidate; leave previous record/tag relationships unchanged.

Shared tag rows are retained. Tags use the existing unique name and composite relationship keys. Source refresh remains idempotent and does not create duplicate content. No tags are inferred when a publisher provides none.

RSS category text and Atom category terms are extracted. Hacker News internal indexing `_tags` are excluded; explicit public tags are accepted if present. List, detail and JSON export return `tags` as objects containing `id` and `name`. Detail renders a separate Source tags section only when tags exist.

## Verification

Real PostgreSQL/API tests cover tag normalization and invalid inputs, RSS/Atom parsing, duplicate ingestion, shared tag identity, omitted tags, replacement, explicit clear, rejected-update preservation, and list/detail/JSON export round trips. API suite passes 30 results with no skips. UI production build passes. The existing live feeds may have no categories for some/all entries; absence of a tag section is expected for those records, not evidence of invented tags or failed AI.

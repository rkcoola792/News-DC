# Automatic research ingestion — F1/F2/F44

Decision date: 6 November 2026. The user selected automatic research ingestion before the AI phase. This supports PRD discovery/search goals and the assignment's news-and-research success criterion, using the existing modular monolith and Prisma.

## Source and behavior

- Registered source: **arXiv · data center research**, API source ID `10000000-0000-4000-8000-000000000003`.
- Query: titles containing “data center”, “datacenter” or “data centre”; newest submissions first, at most 50 results per run. This is bounded discovery, not exhaustive coverage/backfill.
- The Atom adapter produces `RESEARCH` candidates with title, source abstract, authors, publication/update dates, versioned arXiv identifier, available DOI/journal reference and source category tags. Missing optional fields stay absent/null.
- Original links use HTTPS arXiv abstract pages, not PDF downloads. Abstracts are source metadata, not generated summaries. No paper files are hosted or AI calls made.
- Existing normalization, metadata relevance gate, keyword topic rules, Prisma transactions/tag mappings, canonical URL/title-domain fingerprint deduplication and persistent run tracking apply. arXiv category codes are source tags, distinct from controlled NewsDC topics.
- Versioned identifiers and original links are preserved. Existing title/domain fingerprint deduplication collapses unchanged-title versions; changed-title versions can remain separate. This is not a full paper-version reconciliation system.
- The source participates in protected Dashboard source controls/manual runs and the existing opt-in scheduler. Enabling a source does not enable the scheduler. Seeding preserves operator enable/disable state.
- A process-local request queue uses one connection and waits at least three seconds between arXiv requests, including retries. Run only one ingestion process across machines/containers; this MVP does not provide distributed rate limiting. Responses remain bounded to 2 MB, requests time out, redirects are rejected, and only exact registered endpoints may be fetched.
- Invalid XML, upstream query-error feeds, invalid identifiers and missing-result structures fail safely. A genuine zero-result feed is allowed. No-result/error responses are never replaced with demo content.

## Terms and attribution

[arXiv API terms](https://info.arxiv.org/help/api/tou.html) permit descriptive metadata use, require a single connection and no more than one request every three seconds, and encourage abstract-page links. Full-paper redistribution requires appropriate rights. [API manual](https://info.arxiv.org/help/api/user-manual.html) documents Atom metadata and query parameters. Source attribution and original URLs are retained; no arXiv endorsement is claimed.

## Verification

Unit checks cover multiple authors/links/categories, namespace attributes, DOI/journal metadata, legacy/versioned IDs, optional fields, zero results and malformed/error responses. The database/API integration case exercises real Prisma persistence, source tags, research search and repeat-ingestion deduplication using a controlled Atom fixture in the isolated test database.

Live adapter fetch on 6 November returned 50 real research candidates. See IMPLEMENTATION_STATUS.md for the final executed database/runtime evidence; a successful fetch alone does not prove persistent ingestion.

## Future AI budget decision

The user has approximately $10 in OpenAI credit and wants a low-cost demo. That balance is not an approved spending cap. Provider/model and a small explicit development cap remain undecided. Agree on those before any paid calls; keep keys server-side, reuse persisted outputs, bound input/output and retries, and provide an off switch when implementing the approved AI phase. No OpenAI key is needed for research ingestion.

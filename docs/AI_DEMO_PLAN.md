# NewsDC AI demo plan — current handoff

> Current implementation update — 6 November 2026: cited assistant, automatic enrichment, cached/source-linked trends, research backfill and approved YouTube public metadata are implemented. See [ASSISTANT_AUTOMATION.md](ASSISTANT_AUTOMATION.md) for current contracts/evidence; older pending/deferral notes below are historical. Full user acceptance, relevance dataset review and public deployment remain open.

6 November 2026. Gemini-first/OpenAI-fallback routing and operator-triggered persisted enrichment are delivered. No application spending or fixed daily request cap is configured, per the user's latest instruction. Keys remain server-side; provider quotas, bounded retries/timeouts, input/output bounds and concurrency controls remain.

## Delivered

- Primary gemini-3.5-flash-lite, two temporary-failure retries, then one gpt-5.4-mini fallback. Safe refusals do not fall back. Usage and provider provenance persist through Prisma.
- F7–F12: relevance/confidence, controlled topics, intelligence type, summaries, insights and explained scores. Prompt v2 uses model-selected source evidence IDs resolved/validated against original excerpts.
- Operator selection/queuing, persistent processing history, thin/video-without-transcript skips, successful-output cache, source/prompt-version invalidation and stale-response discard.
- Current stored output contributes to ranking and search and is shown with scope/provenance/evidence in detail. No generation on reads.
- Two real research abstracts successfully processed through Gemini. The collection remains 141 records; 139 remain unprocessed. This is not a claim of complete relevant-dataset coverage.

See CONTENT_ENRICHMENT.md and IMPLEMENTATION_STATUS.md for contracts, executed tests and limitations. Provider details remain in AI_PROVIDER_ROUTING.md.

## Next: cited assistant (F31/F32)

1. Retrieve up to five relevant stored items through Prisma/PostgreSQL full-text search and supported filters.
2. Send bounded excerpts with stable content IDs and attribution through the shared provider gateway. Treat sources as evidence, not instructions.
3. Generate only from retrieved evidence; validate every returned citation ID against retrieved records and build links from database URLs.
4. Return insufficient evidence without a model call for empty/weak retrieval; reject fabricated citations.
5. Add safe caching/error/abuse controls and test the five assignment questions plus insufficient evidence with actual collected content.

Following work: automatic enrichment after ingestion, broader quality/accessibility/user acceptance, progress toward 500 relevant records and public deployment. Optional AI trends/video source coverage remain separate P1 work. No vectors, registration or P2 scope expansion is required.

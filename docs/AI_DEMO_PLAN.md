# NewsDC AI demo plan — Gemini first

Updated 6 November 2026. Provider connection/routing foundation is implemented; enrichment and assistant remain pending. See [AI_PROVIDER_ROUTING.md](AI_PROVIDER_ROUTING.md) for current behavior and executed evidence.

## Current decisions

- User initially approved planning with a $1 ceiling, then preferred Gemini free tier, subsequently authorized OpenAI fallback after Gemini retries, and finally explicitly removed application spending/daily caps. Current behavior follows the latest instruction: Gemini first, two temporary-failure retries, then one OpenAI fallback; no application spending or fixed daily cap.
- Keys are configured server-side as GEMINI_API_KEY and OPENAI_API_KEY. Local operator-only provider checks are enabled. Keys were not displayed or committed.
- Models: gemini-3.5-flash-lite primary, gpt-5.4-mini fallback; both passed model-access checks. Live generation paths were verified with tiny fixed probes. Free-tier availability and quotas are account/project properties, not guaranteed by the application.
- Keep bounded retries, input/output, timeout, concurrency guard and provider quota handling. Usage is recorded through Prisma across restarts. No bulk AI processing or public arbitrary-prompt endpoint exists.

## Next implementation: persisted enrichment (F7–F12)

1. Start with a manually selected batch of 10 source-rich records, using the implemented provider chain. Do not automatically process the entire collection.
2. Use one validated structured response per eligible record: relevance/confidence/reason, controlled topic labels, intelligence type, concise summary, supported insights and explained relevance/quality estimates. Reject invalid enums/ranges/slugs and unsupported facts. Treat source text as untrusted evidence, never instructions.
3. Persist output, provider/model/prompt version and input hash through Prisma. Reuse matching successful outputs on reads; invalidate stale outputs when source text changes. Record safe processing failures and retry provenance.
4. Weak metadata/videos without transcripts get metadata-only classification or insufficient-text handling, never invented summaries or claims that a full paper/video was read.
5. Connect stored output to detail, filters and recommendation ranking. Label generated output, abstract-only limitations and score estimates. Preserve useful non-AI feeds when generation is unavailable.

## Following implementation: cited assistant (F31/F32)

1. Retrieve at most five relevant stored items through Prisma/PostgreSQL full-text search with supported filters; no vectors/external search required.
2. Send bounded excerpts with stable content IDs and attribution to the shared provider chain. Generate only from that evidence.
3. Validate all returned citation IDs against retrieved records and build links from stored original URLs. Reject fabricated/unknown citations.
4. Return insufficient evidence without a provider call when retrieval is empty/too weak. Test the assignment's five example questions plus insufficient evidence.
5. Add safe caching and abuse controls, recoverable quota/error states and live acceptance evidence. Do not mark assistant/enrichment complete on provider connectivity alone.

## Configuration

Use only the root gitignored .env or backend deployment secrets:

```env
GEMINI_API_KEY=your-gemini-key
OPENAI_API_KEY=your-openai-key
AI_PROVIDER_ENABLED=true
```

Fresh .env.example defaults the enable flag to false. No VITE_ provider keys. Adding keys enables no content enrichment by itself. Provider and data-use references are linked in AI_PROVIDER_ROUTING.md. Public hosting, broader relevant-dataset coverage and optional live video sources remain separate tracked work.

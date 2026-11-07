# AI provider routing — Gemini first

> Current implementation update — 6 November 2026: cited assistant, automatic enrichment, cached/source-linked trends, research backfill and approved YouTube public metadata are implemented. See [ASSISTANT_AUTOMATION.md](ASSISTANT_AUTOMATION.md) for current contracts/evidence; older pending/deferral notes below are historical. Full user acceptance, relevance dataset review and public deployment remain open.

Updated 6 November 2026. Implements the user's provider priority and fallback request within the existing Express/Prisma modular monolith. This gateway now supports operator-controlled persisted enrichment (F7–F12); the grounded assistant (F31/F32) is next. See CONTENT_ENRICHMENT.md.

## Current policy

1. Primary: `gemini-3.5-flash-lite` through Gemini Developer API.
2. Retry temporary failures twice (three Gemini attempts total), waiting 2 and 4 seconds. Honor longer Retry-After values up to 10 seconds. If the provider requests a longer pause, go to fallback instead of retrying sooner than allowed.
3. Fallback: one `gpt-5.4-mini` request through OpenAI Responses, with reasoning disabled and response storage disabled.
4. Invalid credentials/unavailable model and recognized exhausted daily quota skip futile Gemini retries and go straight to fallback. Missing primary configuration fails before any provider call. Safety refusals do not fall back; unknown/invalid output is never accepted as success.
5. No application spending cap or fixed daily request cap, per the user's subsequent instruction. Provider quotas, per-request input/output/response bounds, 20-second timeout, one-request guard and ordinary API abuse protection remain. There are no unbounded retry loops or automatic bulk jobs.

## Configuration and controls

Root gitignored `.env`:

```env
GEMINI_API_KEY=your-gemini-key
OPENAI_API_KEY=your-openai-key
AI_PROVIDER_ENABLED=true
```

Both keys stay server-side and are forwarded to the app container as environment values. Never use a VITE_ prefix, include keys in URLs or send them from the browser. Fresh example configuration defaults provider checks to false. Local checks are enabled at the user's request. No model/key is bundled into frontend source.

Operator endpoints, behind the existing bearer key:

- `GET /api/v1/admin/ai/providers`: configuration flags, models/retry policy, recent safe call records and usage counters. `openaiCapUsd` and `dailyRequestLimit` are null to indicate no application cap. No credential values or source prompts are returned.
- `POST /api/v1/admin/ai/providers/check` with `{}`: fixed small JSON connection probe through the actual chain; returns successful provider/model, fallback flag, safe attempts and token counts. Arbitrary prompts/fields are rejected. A check may use paid OpenAI fallback.

Dashboard includes a separate AI provider connections component, usage visibility and check button. Operator enrichment now uses this gateway; the assistant remains unavailable until implemented. Connecting keys does not fabricate answers.

## Persistence and usage

Additive migrations 004 and 005 add provider call/usage tables and remove the originally proposed cap checks without editing an applied migration or deleting history. All application reads/writes use Prisma. Readiness now requires all five migrations.

Each attempt is recorded before transmission in a serializable transaction, with bounded contention retry. It stores provider/model/status/timestamps/token counts and safe error codes, never prompt text or keys. OpenAI accounting initially records a conservative $0.05 exposure per unresolved request, then replaces that exposure with estimated cost from returned usage when available. This is accounting, not a spending reservation that blocks calls. Unknown/network-failed charges remain conservatively estimated. Finalization is idempotent. Counters survive restarts, and the app's request-day counter uses UTC; it is not a claim about Google's quota reset timezone.

Estimated OpenAI token cost uses the reviewed standard rates for the fixed model: $0.75 per million input tokens and $4.50 per million output tokens, with conservative uncached input accounting. This is an estimate, not an invoice, and excludes unrelated usage/taxes. Model/rate changes require reviewing accounting assumptions. Gemini billing tier cannot be established from an API key; the user confirmed they will use their free-tier key.

References: [OpenAI model/pricing](https://developers.openai.com/api/docs/models/gpt-5.4-mini), [OpenAI structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs), [Gemini model](https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite), [Gemini pricing/data use](https://ai.google.dev/gemini-api/docs/pricing), [Gemini rate limits](https://ai.google.dev/gemini-api/docs/rate-limits). Checked 6 November 2026. Free-tier input may be used to improve Google's products under its terms; send permitted public source metadata only when enrichment is implemented.

## Executed verification

- Both configured keys passed model-access checks without printing values.
- Live Gemini probe: initial network failure, second attempt succeeded, `{ok:true}`, 20 input/5 output tokens; no OpenAI fallback.
- Controlled failure test: locally simulated three Gemini 503 responses, then one real OpenAI probe succeeded; 52 input/14 output tokens, estimated $0.000102. Simulated Gemini failures are explicitly test records, not an upstream outage claim.
- Final isolated suites after cap removal: **48 API results and 7 DB results pass**, no skips. Coverage includes retry order/backoff/Retry-After, safety refusal, invalid output, concurrent requests, operator authorization, strict probe input, five migrations, atomic persistent usage beyond $1/50 attempts and idempotent accounting. Tests use fake transports except the two explicitly identified live checks.
- Production frontend and Docker builds pass. Final smoke/format and operator-screen verification are recorded in IMPLEMENTATION_STATUS.md.

## Next feature

Operator-triggered enrichment is delivered; see CONTENT_ENRICHMENT.md. Next: PostgreSQL/Prisma retrieval and the cited assistant, then broader quality, automation and delivery acceptance. No arbitrary public generation endpoint was added.

# Deployed NewsDC verification — 7 November 2026

Target: <https://news-dc.onrender.com/>. Comparison: running local Docker app at `http://127.0.0.1:5000`.

Verdict: **The deployment serves the expected frontend and the sampled public backend flows work. Full browser acceptance remains incomplete. Production data coverage differs materially from local.** No production settings, ingestion runs, deployment configuration or application code were changed during this audit.

Acceptance reference: `TESTING_AND_ACCEPTANCE.md`, `PRD.md` (including the dataset target), and the current client-assignment acceptance audit. Passing an HTTP route means the SPA entry point loads; it does not establish that React rendered that screen correctly.

## Executed checks

| Area | Observed result |
| --- | --- |
| Availability | HTTPS homepage, liveness and database readiness returned 200. |
| Direct navigation | Home, Search, Topics, Saved, Ask, Dashboard, Preferences, History, Trending and a real content-detail URL returned the SPA HTML. |
| Frontend parity | Deployed JS `/assets/index-CpFPYfUo.js` and CSS `/assets/index-BPO0VDWz.css` returned 200 and matched the running local assets byte for byte using SHA-256. This compares the running local build, not every uncommitted source file. |
| Library | Deployed visible collection: **162** records. Running local visible collection: **731** records. |
| Four formats | Production totals: 50 articles, 50 research, 41 discussions, 21 videos. Sampled type filters returned the requested type. |
| Video discovery | All 21 returned video IDs were unique and linked to supported YouTube hosts. Playback availability was not tested. |
| Search | `q=cooling` returned 15 results in production versus 102 locally. Combined research/cooling search returned 9 research items; sampled ascending title order was correct. |
| Pagination | Page 2 returned the requested page with no overlap with the sampled first page. |
| Topics/publishers | All 14 topics returned; cooling topic content returned 17 matches. Production had 35 publishers versus 49 locally. |
| Recommendations | ForYou and Trending returned 200 with results. Personalized browser interaction was not tested on this origin. |
| Detail | A real item, its related items and summary-status endpoint returned 200. A thin-source item explicitly reported SKIPPED enrichment instead of inventing a summary. |
| Trends | Source-linked topic counts returned 200. Cached AI report was null; report generation was not triggered. |
| Exports | Filtered JSON and Markdown exports returned 200 with attachment disposition. JSON research/cooling results contained 9 records. |
| Assistant | A real cooling/power question returned 200 in **13.6 seconds**, with 3 paragraphs and 5 sources. Paragraph citation IDs matched returned sources, and source URL schemes were safe. Response reported OpenAI `gpt-5.4-mini`; this does not independently verify the Gemini retry sequence. |
| Evidence absent | A deliberately unmatched assistant question returned an honest insufficient-evidence response with no sources. |
| Validation | Short assistant question, reversed dates, invalid UUID and negative page size returned structured 400 errors. Unknown API endpoint and nonexistent valid content UUID returned 404. |
| Operator boundary | Unauthenticated metrics request returned 401 and `Cache-Control: no-store`. No production operator key was used. |
| Response headers | CSP, frame denial, nosniff, no-referrer and request IDs were present. No provider-key pattern matched the sampled JS bundle; this is a limited pattern check, not proof that all secrets are safe. |

## Differences and recommended follow-up

1. **Production data coverage is smaller.** With only 50 research items versus the much larger local research collection, production search, recommendations and assistant retrieval cannot reproduce local coverage. Check the production source/backfill and enrichment progress through the protected Dashboard. Complete permitted backfill and verify deduplication and relevance before claiming the PRD target of 500 relevant records. The public API cannot establish the protected processing totals or why backfill has not reached local coverage.
2. **Measure deployed latency.** Sampled successful public data calls took approximately 0.4–3.3 seconds; the uncached assistant answer took 13.6 seconds. These were successful single samples, not load-test percentiles or evidence of a sustained outage. Confirm the loading/retry experience visually and profile database queries and provider time if this is too slow for the demo.
3. **Finish actual browser acceptance.** Chrome blocked automation because an extension UI was open, including after the user's continue response. No desktop/mobile rendering, bookmark persistence, preference/history interaction, theme, clickable citations, console errors or responsive layout was signed off in this deployment audit. Matching frontend assets is useful parity evidence but cannot replace browser testing.
4. **Verify production operator workflows separately.** Scheduled ingestion, protected imports, backfill, enrichment, provider routing/retries, trend generation and restart recovery were not exercised on production. No disruptive outage or load tests were performed on the live service.
5. **Recheck prior local findings against the current UI.** The separate acceptance audit records unresolved keyboard shortcut coverage, Dashboard polling/form behavior and citation presentation observations. This audit neither confirms nor clears those UI issues on production.

Browser-local bookmarks/preferences/history are scoped to each origin. Localhost data not appearing on the deployed origin is expected under the agreed product requirements.

## Evidence and reproduction

- `artifacts/deployment-probe-2026-11-07.json`: public page/API responses, local comparisons, timings and headers.
- `artifacts/deployment-flows-2026-11-07.json`: deployed assets, filters, pagination and assistant answers.
- `artifacts/deployment-verification-2026-11-07.json`: 8 passing assertions, including asset hash parity, video uniqueness, citations, pagination and authorization.
- Reproduction scripts: `artifacts/deployment-probe.mjs`, `artifacts/deployment-flows.mjs`, `artifacts/deployment-verify.mjs`. Flow probes make two ordinary assistant requests; repeated runs may use the response cache or incur provider requests.

Security coverage was limited to ordinary public requests, input validation, a missing-credential check and response inspection. No claim of complete vulnerability coverage or guaranteed crash-free operation is made.

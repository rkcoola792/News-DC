# Web-flow and abuse review — 6 November 2026

This extends the automated run (78 passing checks and isolated database reliability verification) with browser interaction, bounded live API probes, and code review. It is not a claim that every feature is perfect or that the app is vulnerability-free. No application fixes were made.

## What was actually exercised

- Chrome, current local Vite UI: feed to real detail; save; Saved; reload and verify persistence; remove only the audit-added bookmark.
- Search cooling; combine publisher=arxiv with Research; observe nine matching results; clear filters.
- Trending page two: ranks 11 through 20.
- Preference edit/save/refresh flow was partially interrupted by browser tooling. Saved Cooling preference affected feed order; original unselected Cooling preference was restored afterward. Do not count this as full preference matrix verification.
- Mobile-layout navigation to Topics and Cooling feed; DOM measurements showed no horizontal document overflow in that observed feed. Browser zoom means requested viewport dimensions are not real-device certification.
- Videos plus Cooling produced an appropriate zero-results state with disabled pagination.
- Dashboard remained locked in the observed tab, despite the operator handoff. Authenticated UI controls were not exercised. The operator key was not printed or copied into chat.
- Live API readiness, excessive limit validation, SQL-like search input, unauthenticated metrics/provider-check rejection, malformed import JSON, and read-only authenticated provider status. Provider configuration was enabled with both keys configured. No paid provider calls were made.
- Live API returned CSP, DENY framing protection, nosniff, and no-referrer headers.
- Import-failure response reproduced using an isolated local server with an in-memory DB stub, not production records.
- npm audit including development packages returned zero published advisories.

Browser automation repeatedly stopped because a Chrome extension UI was open; screenshot commands also timed out. These are tool limitations, not established application defects. The browser viewport was reset. Normal reading activity was recorded locally. No source toggles, real imports, ingestion runs, database changes, or AI calls were triggered on the application.

## Recommended changes

### 1. Authenticate and throttle before parsing bodies — medium security risk

Evidence: services/api/src/app.js installs express.json before public limiting and before the operator authentication middleware in routes.js. An unauthenticated POST with malformed JSON to /admin/content/import returned INVALID_JSON/400, demonstrating that parsing occurs before authentication. Admin requests skip the public limiter entirely.

Potential abuse: unauthenticated clients can make the app buffer/parse bodies up to 1 MB per request before rejection. Concurrency amplifies resource use even with the existing size limit. No load attack was performed, so production availability impact is unmeasured.

Change: install cheap request admission limits before JSON parsing; authenticate operator routes before parsing their bodies; use route-appropriate body limits. Keep bounded parsing and structured errors. This does not require reinstating AI spending or daily caps.

### 2. Preserve Dashboard content during polling — medium usability risk, code-confirmed

Evidence: Dashboard retries metrics/sources every 15 seconds. useResource resets data to null during each retry; Dashboard renders metrics, sources, recent runs and the import details inside `data && ...`.

Effect: these sections unmount and remount on refresh. An open import details panel can close and an active field can lose focus. Parent-state textarea contents survive, so permanent typed-data loss is not claimed. AIProviderControls is outside this conditional in the current code and is not included in this finding.

Change: retain the last successful data while refreshing; distinguish initial loading from background refresh; show non-destructive refresh/error indicators. Confirm with a browser test that an open form and focus survive a 15-second poll. Authenticated browser reproduction remains outstanding.

### 3. Report failed imports accurately — medium functional issue

Evidence: isolated POST /admin/content/import with an invalid record returned HTTP 200 and data.status=FAILED, inserted_count=0, failed_count=1. Dashboard's act() treats all successful HTTP responses without a message as “Operation completed.”

Effect: an operator can see a success-style message although no content was imported.

Change: explicitly summarize inserted/skipped/failed counts and processing status in the UI. Choose a clear partial/all-failure API contract and keep recorded run IDs available. Do not blindly retry a partly successful import. Add a UI regression check for zero successful records.

### 4. Strengthen operator credential lifecycle — hardening recommendation, not an auth bypass

Current server-side bearer checking and constant-time comparison are useful protections. However, the same long-lived operator secret authorizes all operator endpoints. There is no session expiry or per-action operator identity. Anyone who obtains that secret can import data, change sources, trigger ingestion and repeatedly invoke paid provider checks.

Change: exchange the operator credential for a short-lived authenticated session; support revocation/rotation, audit sensitive actions without logging secrets, and add a bounded authenticated action-rate limit. Keep provider keys server-side. Spending/daily caps were explicitly removed by the user and are not proposed here. No stolen-key or account-compromise exploit was demonstrated.

### 5. Avoid unbounded readiness probing — low/medium availability hardening

The unauthenticated readiness endpoint queries the migration table and is registered before the public rate limiter. A caller can invoke database work outside that limit. No exhaustion test was performed.

Change: use a short cached readiness result or a separate health-probe admission limit. Keep liveness independent of database failure. Final network exposure is a deployment decision and was not changed.

### 6. Distinguish unavailable formats and AI scope — low demo/product issue

Video lists can be empty because no dedicated live video source is configured. AI provider connectivity is enabled, while enrichment and cited assistant answers remain unavailable. This is current scope, not a broken working feature.

Change: make these availability distinctions explicit in the client demonstration and empty states. Complete enrichment/assistant work separately before claiming those features work. Do not add simulated answers or sample content to hide gaps.

## Security controls observed and limits

- Unauthenticated operator metrics and provider checks returned 401; read-only provider status with the configured credential returned 200.
- Input bounds and generic server error handling exist; application database queries use Prisma. SQL-looking search text is tokenized as a search query; a 200 response with matches is not by itself SQL injection.
- External ingestion is restricted to reviewed registry URLs with redirects denied, response limits and timeouts. No arbitrary server URL-fetch endpoint was found in the reviewed routes.
- The current public UI renders source text with React rather than raw HTML and validates HTTP(S) source links. No stored/reflected script execution was established.
- Security headers and dependency advisory results are positive checks, not proof against all attacks.
- Public scraping of intentionally public metadata is possible by design; protect upstream permissions and use bounded read/export requests. This is not a demonstrated authorization defect.
- Multi-instance locks/rate limits, proxy client identity, HTTPS, key handling in hosting, backups, real-device behavior, full keyboard/screen-reader coverage, authenticated dashboard interaction, and controlled load testing still need verification. No deployment changes were made.

## Suggested implementation order

1. Request admission/authentication order and accurate import outcomes.
2. Non-disruptive Dashboard polling with a focused browser regression test.
3. Operator sessions/action auditing and cached readiness.
4. Complete authenticated UI, mobile/browser and accessibility acceptance checks before client sign-off.

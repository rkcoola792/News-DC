# NewsDC acceptance audit — 7 November 2026

## Verdict

Most application capabilities are implemented and the tested contracts pass. Strict client acceptance is **not yet complete**, independently of deployment. Outstanding items include keyboard shortcuts, relevance-dataset review, citation presentation, Dashboard refresh behavior, contradictory documentation, and remaining browser acceptance. Passing automated checks does not establish that every visual or generated answer is correct.

Reference baseline: the two-page client assignment at `C:/Users/rkcoo/Downloads/NewsDC_Recruitment_Assignment v1.0 (1).pdf`, docs/PRD.md, docs/FEATURES.md, docs/TRACEABILITY.md and subsequent user-approved provider/source decisions. No newer attachment was supplied during this audit. Public hosting/TLS/release work is excluded at the user's request.

## Executed evidence

- Frontend production build: PASS. Frontend local-state logic: 23 PASS.
- Full backend/database suite: 80 PASS, zero skips, using a uniquely named disposable PostgreSQL database, removed afterward. Live AI and schedulers were disabled in the test process; mocked provider cases test retry/refusal/citation/failure behavior without paid calls.
- Earlier first run inherited AI_PROVIDER_ENABLED=true from development and failed the test expecting AI_DISABLED (one failing child and its parent). Explicit test settings made all checks pass. The test harness needs its own deterministic configuration; do not erase this failure from the evidence.
- Real scheduler interval and isolated DB outage/recovery passed immediately before the video fix: 60,156 ms actual tick, outage readiness/content 503 while liveness stayed 200, then restored readiness/persistence/deduplication. That harness owns/removes only its disposable container.
- Local app rebuilt/restarted to load the video-source fix; database container and volume preserved. Live smoke PASS for SPA, readiness, content, cooling search, all 14 topics and protected metrics.
- Live video discovery: 2 to 21 records; 19 inserted, 1 duplicate, 0 failures. Repeat through the running API: 0 inserted/20 duplicates/0 failures. Details in VIDEO_DISCOVERY.md.
- Latest read-only snapshot: 736 total records; 176 AI-confirmed relevant, 0 AI-excluded, 560 unclassified. Automatic processing makes these figures time-dependent. Total indexed count does not prove 500 relevant records.
- Prisma schema validation and git diff whitespace checks PASS. Whole-repo Prettier check reported the separately edited docs/CLIENT_PRESENTATION_GUIDE.md and the audit JSON artifact; the audit JSON was formatted afterward. The client guide remains a formatting follow-up, not an app runtime failure.
- Prior-to-pause browser actions in this same acceptance task: authenticated Dashboard displayed actual processing/coverage/source runs; pause worked; report refresh produced a persisted report; an open import panel closed after polling. Public detail/expandable scores, save/reload/remove, history, preference save/reload/restore, search/type/sort, Trends/source expansion, assistant responses and video metadata were exercised. A mobile assistant screenshot was inspected.
- After the user's UI changes: current feed/navigation were observed, but subsequent clicks/screenshots were repeatedly interrupted by extension UI blocking, detachment and browser command timeouts. These are tooling failures, not demonstrated application crashes. A full fresh all-screen responsive pass is therefore UNVERIFIED.
- Background enrichment was resumed via its protected API (200, paused=false), restoring the state that preceded testing. Test bookmark/preferences were restored; normal reading history and valid generated/cache/run records remain. No fake records were inserted into the application database.

## Every feature in FEATURES.md

“Verified” below means the listed evidence was executed; it does not mean exhaustive visual, semantic or production certification. “Implemented/limited” identifies real capability with remaining acceptance scope.

| ID  | Feature            | Audit status and evidence                                                                                                                                                                                    |
| --- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| F1  | Source ingestion   | Verified API/RSS/research/video adapters, real source runs and integration fixtures; new focused HN video source verified live.                                                                              |
| F2  | Metadata           | Verified optional fields, authors, tags, engagement capture, API/detail/export round trips. Missing values are not fabricated.                                                                               |
| F3  | Deduplication      | Verified canonical/fingerprint checks, repeated ingestion and repeated live video run.                                                                                                                       |
| F4  | Scheduled refresh  | Verified real 60-second scheduler and failure recovery in owned infrastructure; normal refresh remains opt-in.                                                                                               |
| F5  | Validation         | Verified malformed metadata/query/URL/type/date rejection and safe failed-run counts.                                                                                                                        |
| F6  | Source controls    | Verified protected API cases and actual Dashboard state; not every latest UI toggle was manually rerun.                                                                                                      |
| F7  | AI relevance       | Implemented/limited: persisted relevance and exclusion tests pass; only 176 confirmed relevant in final snapshot. Human quality sampling remains necessary.                                                  |
| F8  | AI categories      | Verified controlled taxonomy validation/persistence and source-change invalidation; 14 topic filters exposed.                                                                                                |
| F9  | Summaries          | Verified grounded schema/evidence persistence and real enriched detail/feed display; only eligible processed items have summaries.                                                                           |
| F10 | Insights           | Verified structured persistence and supporting quotes; exhaustive semantic review is pending.                                                                                                                |
| F11 | Quality scores     | Verified ranges/rubric reasons and expandable detail display; scores are model estimates, not audited publisher credibility.                                                                                 |
| F12 | Intelligence types | Verified controlled-label schema and persistence; corpus-wide classification is unfinished.                                                                                                                  |
| F13 | Trends             | Verified counts/source expansion, cached-report contracts and protected refresh. New evidence invalidates cached synthesis; final snapshot had counts but no currently valid AI report.                      |
| F14 | ForYou             | Verified preference/history ranking, stored AI bonus and 1,000-candidate bound. Explicit discovery-of-new-topics acceptance remains weak/not separately demonstrated.                                        |
| F15 | Trending           | Verified freshness/engagement/AI signal ranking and API pagination; live generated-theme coverage is as limited as F13.                                                                                      |
| F16 | Topic feeds        | Verified 14-topic API and browser topic navigation/filtering.                                                                                                                                                |
| F17 | Related content    | Verified shared-category recommendations. Explicit related-discussion destination links need acceptance work; HN discussionUrl is stored but not rendered in the reviewed UI.                                |
| F18 | History            | Verified unique bounded storage logic and real detail opening/history display. Latest visual pass incomplete.                                                                                                |
| F19 | Preferences        | Verified save/reload and restored the original Cooling selection in browser; draft/storage failure tests pass.                                                                                               |
| F20 | Discover UI        | Observed connected feed and enriched summaries; latest complete responsive matrix remains unverified.                                                                                                        |
| F21 | Trending UI        | Observed ranked feed and expandable source-linked themes; current changed UI needs final visual pass.                                                                                                        |
| F22 | Topics UI          | API and navigation observed; latest changed icon/layout requires complete visual acceptance.                                                                                                                 |
| F23 | Detail UI          | Observed source metadata, enriched summary, evidence and related rows. Updated labels and all-width layouts not fully reverified.                                                                            |
| F24 | Search             | PostgreSQL tests and real combined queries pass.                                                                                                                                                             |
| F25 | Bookmarks          | Browser save/reload/remove and corrupt/denied storage tests pass; current UI visual coverage incomplete.                                                                                                     |
| F26 | Dashboard          | Authenticated metrics/source/coverage controls observed. Polling still closes an open import panel.                                                                                                          |
| F27 | Filters/sort       | API combinations, validation and actual search/type/sort actions tested; full date/publisher/score UI matrix outstanding.                                                                                    |
| F28 | Theme              | Implemented with local persistence; historical smoke exists, but a fresh post-change full theme/contrast pass is unverified.                                                                                 |
| F29 | Pagination         | Integration no-duplicate pages and out-of-range recovery tests pass; current all-format pagination UI matrix incomplete.                                                                                     |
| F30 | Keyboard shortcuts | Missing: no shortcut handler found. Assignment explicitly requests shortcuts despite the local P2 deferral. Ordinary Tab/Enter navigation is not a shortcut system.                                          |
| F31 | Assistant          | Live example queries returned controlled cited/insufficient responses; retry/cache/retrieval tests pass. Not a general web-search or multi-turn assistant.                                                   |
| F32 | Citations          | Retrieved-ID/URL validation passes and sampled claims match descriptions; internal [S1]/[S4] markers leak into paragraph text and need presentation cleanup. Semantic support cannot be proven by IDs alone. |
| F33 | JSON export        | Live filtered research export and contract tests pass; exports are capped at 100 records.                                                                                                                    |
| F34 | Markdown export    | Live attachment/source URL output and tests pass; max 100 records.                                                                                                                                           |
| F35 | Docker             | Local app build/restart/health/smoke verified. Public deployment explicitly excluded.                                                                                                                        |
| F36 | Errors/logging     | Safe failure/timeout/recovery tests pass; import outcome messaging remains misleading for all-failed rows.                                                                                                   |
| F37 | Documentation      | Partial: current source contracts exist, but README/PRD/tracker sections still contradict newer AI/data status.                                                                                              |
| F38 | Agent/manual logs  | Maintained with actual tests and limitations; earlier evidence must not be presented as a new full browser pass.                                                                                             |
| F39 | Multi-format model | Verified all four types, constraints and optional fields in PostgreSQL.                                                                                                                                      |
| F40 | Type filters       | Verified API types and actual research/video/empty filtering.                                                                                                                                                |
| F41 | Video discovery    | Fixed and verified: focused historical HN query, exact supported YouTube IDs, dedupe, cap 20/run, 21 visible videos.                                                                                         |
| F42 | Video detail       | Channel/original-link/no-transcript scope observed; 2 videos have metadata 404 and need a visible availability warning. Playback itself was not certified for all 21.                                        |
| F43 | Video metadata     | Verified oEmbed mapping, fixed endpoint, failure safety, no invented dates/transcripts. 19 metadata COMPLETED, 2 UPSTREAM_404.                                                                               |
| F44 | Research           | Live collection/backfill state plus adapter/search/persistence/backfill/recovery tests verified. No full-paper hosting.                                                                                      |
| F45 | Unified search     | Tested across common model, formats and source attribution; sample queries successful.                                                                                                                       |
| F46 | Observability      | Protected counts, persistent runs/enrichment/provider usage/pause/backfill verified; documentation still has historical schema-only descriptions.                                                            |

## Client assignment acceptance gaps independent of deployment

1. Keyboard shortcuts are explicitly requested in the client PDF but missing/deferred in the local feature list.
2. 736 indexed records is not proof of the conditional 500-relevant-record target. Only 176 were confirmed relevant at the captured snapshot; review/processing is unfinished.
3. Cited assistant reliability works, but GPU-utilization and combined PUE/WUE example questions still lack sufficient retrieved evidence. Honest refusal is correct; demo coverage is partial.
4. Explicit new-topic discovery and related-discussion links are not separately demonstrated by the existing generic ranking/related-content implementation.
5. Final all-screen/mobile/keyboard/accessibility acceptance after the user's UI edits remains blocked/unverified. A presentation guide PDF now exists in output/pdf; its client readiness was not reviewed in this task.
6. README and PRD still contain non-AI-only/141-record/deferred-provider language contradicted by current code and newer feature sections. Reconcile current-state sections while preserving dated history.

## Remaining changes to consider (not implemented in this video fix)

- **Medium:** remove or translate temporary source markers in assistant paragraphs, not only limitations; invalidate old cached answers after changing the output contract. Evidence: cooling answer in artifacts/acceptance-assistant-2026-11-07.json contains [S1] and [S4] alongside public numbered links.
- **Medium:** retain Dashboard data during background polling. Reproduction: open Import permitted content metadata, let metrics refresh, panel is closed; useResource clears data and the parent conditionally unmounts the form.
- **Medium:** report import inserted/skipped/failed counts instead of generic “Operation completed.” A failed ingestion result can be returned with HTTP 200; this was reproduced using an isolated server in the prior review and code remains unchanged.
- **Medium security hardening:** apply cheap admission/authentication checks before JSON parsing; bodies are currently parsed before operator authentication/public throttling. No resource-exhaustion attack was performed.
- **Medium before anonymous public AI release:** use a dedicated short-term assistant request limit/fair scheduling, rather than only the generic 120-request/minute/IP limiter and a shared provider busy guard. Unique questions can miss cache and trigger paid fallback. Do not reinstate the spending/fixed daily caps the user explicitly removed.
- **Low/medium:** “latest” retrieval can prefer older sources with stronger lexical matches. The infrastructure example cited April/June/September abstracts despite newer collection items; add explicit freshness/date scope and test retrieval quality, without inventing missing evidence.
- **Low:** show explicit metadata-unavailable messaging for the two video metadata 404 cases; preserve source attribution and avoid claiming all playback links work.
- **Test reliability:** integration tests must explicitly control provider/scheduler settings; loading development AI-enabled environment produced a false AI_DISABLED assertion failure. Keep live provider tests opt-in.
- **Non-failing warning:** pg emits a concurrent-query deprecation warning in integration/reliability infrastructure. Investigate before a future major pg upgrade.

## Example question results

All five API calls returned 200 and reused saved answers. Three yielded source-linked answers (AI infrastructure, hyperscaler investments, cooling/power); GPU utilization and PUE/WUE returned insufficient evidence. Returned paragraph contentIds resolved to returned source URLs. A nonsense unmatched question returned insufficient evidence; reversed assistant date range returned 400. See artifacts/acceptance-assistant-2026-11-07.json. These checks validate safe behavior and linkage, not every factual interpretation.

## Next acceptance gate

Keep the video fix, review the recommendations above, reconcile the strict client requirements with local priorities, complete relevance/answer-coverage review, and rerun authenticated desktop/mobile/keyboard workflows when browser control is available. No claim that the whole app is perfect or vulnerability-free is made. No public deployment was performed.

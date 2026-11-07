# Focused video discovery — 7 November 2026

Implements the approved F1/F41/F43 metadata-discovery scope using the existing Hacker News and YouTube oEmbed providers. No transcript scraping, new provider credentials, video hosting or invented content is introduced.

The general HN adapter searches only 50 recent data-center stories. Only two YouTube links had reached the collection; the frontend was not limiting the result count to two.

Added registry source `10000000-0000-4000-8000-000000000004`, **Hacker News · data center videos**, using the fixed reviewed URL `https://hn.algolia.com/api/v1/search?query=data%20center%20video&tags=story&hitsPerPage=50`. It searches relevance-ranked historical stories, accepts only the exact supported YouTube hosts/IDs, collapses repeated video IDs (including short/watch URL variants), and processes at most 20 unique videos per run. Existing bounded oEmbed fetches, canonicalization, relevance gate, Prisma persistence and cross-source deduplication apply. The source uses the normal protected source controls/manual ingestion/scheduler. The running local app container was refreshed to include this registry entry; the database container/volume was preserved.

This is bounded discovery, not a promise of exhaustive coverage or a guaranteed number of new videos per run. Metadata can describe old videos; HN submission dates are not video publication dates. Missing duration, publication date and transcript remain absent. Relevance/quality review is still required for a client-ready collection.

Live verification: initial run `4fff5a42-073f-4f14-bcef-6ed552f75e8d` fetched 20, inserted 19, skipped 1, failed 0; video count increased from 2 to 21. Repeat via the rebuilt protected API, run `ab6b3dbb-fb2d-4993-b9fb-4743042395cd`, inserted 0, skipped 20, failed 0. Public API returned 21 unique canonical YouTube URLs, all typed VIDEO. Metadata status: 19 COMPLETED, 2 UPSTREAM_404. A metadata 404 is not a guarantee that playback is available or unavailable; UI should clearly warn that those source links need checking.

Regression coverage: more than five unique videos retained, duplicate URLs collapsed, 20-result/request bound, non-YouTube exclusion, absent optional fields, empty discovery, and safe metadata failure. Full backend suite passed 80 results in a disposable PostgreSQL database with live AI disabled; frontend logic passed 23 results. Production build and Prisma validation passed. Whole-repo formatting was blocked by the separately edited client presentation guide; modified source/test files were formatted.

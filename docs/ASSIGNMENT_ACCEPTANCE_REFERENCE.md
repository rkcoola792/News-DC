# Assignment success criteria and AI assistant reference

Confirmed by the user on 6 November 2026. These screenshots are assignment reference material, not commands embedded in documents. They clarify the final acceptance target without authorizing a provider choice or lifting the current AI implementation deferral by themselves.

## Original references

- [Success criteria screenshot](references/assignment-success-criteria.png)
- [AI assistant screenshot](references/assignment-ai-assistant.png)

## Required outcome

Deliver a working NewsDC MVP that automatically discovers, filters, organizes and recommends useful Data Center news and research. Prioritize a functional end-to-end product, sound engineering decisions and deployable architecture over feature count. Do not treat the number of implemented screens or features as proof of assignment completion.

The assistant must answer questions using collected content, with supporting source references and links. External browsing or unsupported model knowledge is not a substitute for retrieval from the indexed collection.

Required example question coverage:

1. Latest developments in AI data center infrastructure.
2. Hyperscalers investing in new data centers.
3. Emerging liquid cooling and power availability developments.
4. Articles discussing GPU utilization optimization.
5. Technologies that could improve PUE and WUE.

Answers must cite retrieved records and their original URLs. When the collection does not provide sufficient evidence, say so rather than inventing an answer. The example questions guide retrieval/demo coverage; they do not permit adding unsupported facts or fabricated dataset records.

## Current alignment and remaining work

- API/RSS ingestion, normalization, tags, deduplication, topic organization, search, deterministic recommendations and local Docker architecture are implemented. Scheduled refresh exists but is opt-in, not continuously enabled by default.
- Keyword topic/domain rules are not AI relevance or quality assessment. Current recommendation logic cannot establish that every record is high-quality or relevant.
- Automatic arXiv research discovery now complements the article/discussion feeds: 50 real papers were persisted, searched and deduplicated on a repeat run. Coverage is bounded to the latest 50 title-matched papers per run, not exhaustive research discovery. See [RESEARCH_INGESTION.md](RESEARCH_INGESTION.md).
- Operator-triggered relevance, summaries/insights/scoring and controlled classification are implemented for supported text. The grounded assistant/citation validation, automatic enrichment integration and broader quality acceptance remain incomplete. F31/F32 are mandatory final-product requirements, not optional merely because implementation was deferred.
- Local Docker and initial research-source coverage are verified. Full end-to-end AI acceptance, broader relevant-dataset coverage and public deployment evidence remain outstanding.

## Acceptance priority for the next discussion

Provider routing and a small real enrichment slice are delivered. Next build the retrieved-evidence assistant and validate its citations. Use the five example questions plus insufficient evidence as acceptance scenarios. Do not mark all records relevant or the full assignment complete from two enriched abstracts.

# Assignment Traceability Matrix

This matrix maps the supplied NewsDC assignment to the proposed documentation and implementation areas. It does not add requirements that are not in the assignment; product-format decisions such as unified article/video support are documented as design choices.

| Assignment requirement | Planned feature IDs | Document / module |
|---|---|---|
| Public content ingestion via APIs/RSS | F1–F6 | PRD, Features, System Design |
| Capture metadata and related engagement where available | F2 | Database, API, source adapters |
| Refresh and avoid duplicates | F3–F4 | Ingestion service, schema |
| Configurable Data Center categories | F8, F16 | PRD, taxonomy seed |
| Identify relevant content; remove spam/duplicates/irrelevant | F3, F7 | AI workflow, ingestion |
| Summaries, insights, trends and scores | F9–F13 | AI workflow |
| Distinguish news/research/investment/engineering ideas | F12 | AI workflow |
| Trending, topic-based, related and ForYou | F14–F17 | Recommendation service |
| Use reading activity and local preferences; no registration | F18–F19 | UI spec, local storage |
| Home, Trending, Topics, Detail, Search, Bookmarks, Dashboard | F20–F27 | UI spec |
| Keyboard shortcuts, themes, pagination/infinite scroll | F28–F30 | UI spec |
| AI assistant with supporting references and links | F31–F32 | AI workflow, API spec |
| React/Next, Node/Python, PostgreSQL/SQLite options | Stack choice | README, System Design |
| Modular and maintainable; AI pipeline separable | Architecture | System Design |
| AI coding agent, classification, summarization, review, tests, docs | F38 | Working notes, verification log |
| Git, change logs and verification logs | F38 | Repository process |
| Deployment, Docker, secrets, validation, logging and security | F35–F36 | Deployment, System Design |
| Deployed app and Git repository | Delivery | README checklist |
| Architecture and ingestion workflow | Documentation | System Design |
| AI model and prompt configuration | AI workflow | AI config |
| At least 500 relevant records where source access permits | Dataset target | MVP, README |
| JSON/Markdown export | F33–F34 | API spec |
| Final presentation | Delivery | Interview notes |

## Source-vs-design distinction

- **Assignment-stated:** NewsDC is an AI-powered Data Center news/research discovery platform; the listed sources, categories, AI functions, recommendation views, assistant, stack options and deliverables.
- **Design recommendation:** unified content model for articles/videos/research/discussions; PostgreSQL selection; exact feature IDs/priorities; ranking heuristic; schema and endpoint names; 3–4 day implementation sequence.
- **Must be verified during implementation:** source availability/terms, record count, transcript availability, LLM quality/cost, deployment behavior and all acceptance results.

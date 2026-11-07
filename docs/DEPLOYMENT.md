# Deployment and Operations Guide

## 1. Deployment target

Use Docker for repeatable packaging. The exact hosting provider is a project decision and should be selected based on available account access, cost and deployment constraints.

## 2. Environment variables

Backend:

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://...
GEMINI_API_KEY=...
OPENAI_API_KEY=...
AI_PROVIDER_ENABLED=true
AI_AUTO_ENRICHMENT=true
AI_AUTO_INTERVAL_MS=5000
CORS_ORIGIN=https://your-frontend-domain.example
ADMIN_API_KEY=...
INGESTION_ENABLED=true
INGESTION_INTERVAL_MS=1800000
```

Frontend:

```env
VITE_API_BASE_URL=https://your-api-domain.example/api/v1
```

Only public configuration belongs in `VITE_` variables. Never put provider API keys or admin secrets in frontend environment variables.

## 3. Docker Compose topology (illustrative)

```yaml
services:
  api:
    build: ./server
    env_file: ./server/.env
    depends_on:
      - postgres
    ports:
      - '5000:5000'

  worker:
    build: ./server
    command: ['npm', 'run', 'worker']
    env_file: ./server/.env
    depends_on:
      - postgres

  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: newsdc
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - newsdc_pgdata:/var/lib/postgresql/data

volumes:
  newsdc_pgdata:
```

This is a topology example. Adjust Dockerfiles, scripts, health checks and secrets to the actual repository. Add Redis only if BullMQ is selected.

## 4. Release checklist

- [ ] Set production environment variables.
- [ ] Run database migrations.
- [ ] Confirm database persistence and backups.
- [ ] Confirm CORS allows only expected frontend origins.
- [ ] Protect admin endpoints.
- [ ] Confirm LLM key is server-side only.
- [ ] Configure HTTPS.
- [ ] Configure logs and basic monitoring.
- [ ] Run smoke tests against deployed URL.
- [ ] Verify original source links.
- [ ] Verify no secrets are committed.
- [ ] Record deployment URL and release commit.

## 5. Operational considerations

- Use bounded retries and backoff for source and LLM calls.
- Keep source-specific failures isolated.
- Track ingestion counts and AI processing status.
- Avoid unbounded full-dataset LLM reprocessing.
- Keep database backups and retention policy appropriate to the host.
- Respect external source terms and rate limits.

## 6. Current local infrastructure

The repository Compose file provides the combined SPA/Express app on loopback port 5000 and PostgreSQL 16 on loopback port 55434, with health checks and a persistent database volume. For a new checkout, run `npm install`, `npm run setup:local`, then `docker compose up --build -d`; the app entrypoint runs migrations before API startup. Setup preserves existing root `.env` values. Local Docker packaging/start/health and API smoke are verified; public hosting and the full release checklist remain pending. The earlier environment example is architectural reference, not a list of implemented AI settings; current runtime variables are in root `.env.example`.

Provider routing is implemented. Backend secrets: GEMINI_API_KEY and OPENAI_API_KEY; AI_PROVIDER_ENABLED=true enables operator-only connection checks (fresh example false). Compose forwards keys to the app container, never the frontend. Gemini has two temporary-failure retries before one OpenAI fallback. The user removed spending/daily caps; quotas and retry/timeouts remain. Migrations 004/005 preserve usage and remove initial caps. Enrichment and cited assistant remain pending. See AI_PROVIDER_ROUTING.md.

`npm run test:reliability` owns a uniquely named disposable PostgreSQL container on port 55435, observes a real 60-second scheduled run, simulates source/database failure, verifies recovery and cleans up only its test resources. It leaves the demo database untouched. Run one ingestion process; scheduler remains opt-in/off by default.

## Current release boundary

The local Docker app includes six migrations, cited assistant/cache and automatic enrichment. AI_AUTO_ENRICHMENT and INGESTION_ENABLED are independent opt-in switches. Current workspace enables both; examples default false. Run one API/worker process for this MVP: locks and arXiv pacing are process-local. Model failures are retained for operator retry; source/enrichment progress and pause survive restart. Use backend secrets only. No public deployment has been performed; user acceptance and hosting choice precede release.

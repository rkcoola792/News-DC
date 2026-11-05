# Deployment and Operations Guide

## 1. Deployment target

Use Docker for repeatable packaging. The exact hosting provider is a project decision and should be selected based on available account access, cost and deployment constraints.

## 2. Environment variables

Backend:

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://...
LLM_PROVIDER=openai
LLM_API_KEY=...
LLM_MODEL=...
CORS_ORIGIN=https://your-frontend-domain.example
ADMIN_API_KEY=...
INGESTION_CRON=*/30 * * * *
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

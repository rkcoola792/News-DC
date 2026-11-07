import { createAIProviders } from './ai/providers.js';
import { createEnrichment } from './ai/enrichment.js';
import { createAssistant } from './ai/assistant.js';
import { createTrends } from './ai/trends.js';
import { createAutomation } from './ai/automation.js';
import { createIngestion } from './ingestion/service.js';
import { createBackfill } from './ingestion/backfill.js';
export function createRuntime(db, { aiProviders, logger = console, env = process.env } = {}) {
  const providers = aiProviders || createAIProviders(db),
    enrichment = createEnrichment(db, providers, logger),
    assistant = createAssistant(db, providers),
    trends = createTrends(db, providers);
  const automation = createAutomation(db, enrichment, providers, assistant, trends, {
    enabled: env.AI_AUTO_ENRICHMENT === 'true',
    interval: Number(env.AI_AUTO_INTERVAL_MS) || 5000,
    logger,
  });
  const ingestion = createIngestion(db, logger);
  ingestion.setAfterRun(() => automation.wake());
  const backfill = createBackfill(db, automation, logger);
  return { providers, enrichment, assistant, trends, automation, ingestion, backfill };
}

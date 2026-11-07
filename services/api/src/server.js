import { startScheduler } from './ingestion/scheduler.js';
import { fileURLToPath } from 'node:url';
import { seedSources } from './ingestion/sources.js';
import { createIngestion } from './ingestion/service.js';
import { recoverEnrichment } from './ai/enrichment.js';
import { createDatabase } from '@newsdc/db';
import { createApp } from './app.js';
const port = Number(process.env.PORT || 5000);
if (!Number.isInteger(port) || port < 1 || port > 65535)
  throw new Error('PORT must be between 1 and 65535');
const db = createDatabase();
const interval = Number(process.env.INGESTION_INTERVAL_MS || 1800000);
if (!Number.isInteger(interval) || interval < 60000)
  throw new Error('INGESTION_INTERVAL_MS must be at least 60000');
await db.ingestion_runs
  .updateMany({
    where: { status: { in: ['PENDING', 'RUNNING'] } },
    data: {
      status: 'FAILED',
      ended_at: new Date(),
      error_summary: 'Interrupted by previous server shutdown',
    },
  })
  .catch(() => {});
await seedSources(db).catch(() =>
  console.error(JSON.stringify({ event: 'source_registry_unavailable' })),
);
await recoverEnrichment(db).catch(() =>
  console.error(JSON.stringify({ event: 'enrichment_recovery_unavailable' })),
);
const scheduled = createIngestion(db);
const stopSchedule = startScheduler(scheduled, {
  enabled: process.env.INGESTION_ENABLED === 'true',
  interval,
});
const app = createApp({
  db,
  staticDirectory:
    process.env.NODE_ENV === 'production'
      ? fileURLToPath(new URL('../../../apps/web/dist/', import.meta.url))
      : undefined,
});
const stopAutomation = app.locals.runtime.automation.start();
await app.locals.runtime.backfill
  .recover()
  .catch(() => console.error(JSON.stringify({ event: 'backfill_recovery_unavailable' })));
const server = app.listen(port, process.env.HOST || '127.0.0.1', () =>
  console.log(JSON.stringify({ event: 'api_started', port })),
);
server.on('error', async () => {
  stopAutomation();
  console.error(JSON.stringify({ event: 'api_start_failed' }));
  await db.$disconnect();
  process.exitCode = 1;
});
let stopping = false;
function shutdown() {
  if (stopping) return;
  stopping = true;
  stopSchedule();
  stopAutomation();
  const timer = setTimeout(() => process.exit(1), 10000).unref();
  server.close(async () => {
    await db.$disconnect();
    clearTimeout(timer);
  });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

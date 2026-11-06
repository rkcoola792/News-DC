// Explicit, slower integration check. Owns only its uniquely named disposable container.
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { randomBytes } from 'node:crypto';
import { once } from 'node:events';
import { createDatabase, createPool, migrate } from '@newsdc/db';
import { createApp } from '../services/api/src/app.js';
import { startScheduler } from '../services/api/src/ingestion/scheduler.js';
import { seedSources, sourceDefinitions } from '../services/api/src/ingestion/sources.js';
import { createIngestion, ingestSource } from '../services/api/src/ingestion/service.js';

const run = promisify(execFile);
const docker = async (...args) => (await run('docker', args, { timeout: 30000 })).stdout.trim();
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const name = `newsdc-reliability-${process.pid}-${randomBytes(4).toString('hex')}`;
const password = randomBytes(18).toString('hex');
let containerCreated = false,
  db,
  pool,
  server,
  stopSchedule;
const logger = {
  info() {},
  error(line) {
    console.error(line);
  },
};

async function until(check, timeout = 20000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    try {
      if (await check()) return;
    } catch {
      /* Wait for this owned test DB to recover. */
    }
    await pause(500);
  }
  throw Error('Reliability check timed out');
}

try {
  await docker(
    'run',
    '-d',
    '--name',
    name,
    '-e',
    `POSTGRES_PASSWORD=${password}`,
    '-e',
    'POSTGRES_DB=newsdc_reliability',
    '-p',
    '127.0.0.1:55435:5432',
    'postgres:16-alpine',
  );
  containerCreated = true;
  const port = await docker(
    'inspect',
    '--format',
    '{{(index (index .NetworkSettings.Ports "5432/tcp") 0).HostPort}}',
    name,
  );
  const url = `postgresql://postgres:${password}@127.0.0.1:${port}/newsdc_reliability`;
  pool = createPool(url);
  db = createDatabase(url);
  await until(async () => {
    await pool.query('SELECT 1');
    return true;
  });
  // Raw SQL is limited to database-specific verification/migration infrastructure.
  await migrate(pool);
  await seedSources(db);
  const sourceId = sourceDefinitions[0].id;
  await db.sources.update({
    where: { id: sourceId },
    data: { endpoint_url: 'https://unapproved.invalid/reliability' },
  });
  const ingestion = createIngestion(db, logger);
  server = createApp({ db, logger, adminKey: 'isolated-reliability-test-key' }).listen(
    0,
    '127.0.0.1',
  );
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}/api/v1`;
  const request = async (path) => {
    const response = await fetch(base + path);
    return { status: response.status, body: await response.json() };
  };
  assert.equal((await request('/health/ready')).status, 200);

  const started = Date.now();
  stopSchedule = startScheduler(
    {
      run: async () => {
        console.log(JSON.stringify({ event: 'scheduled_tick_started' }));
        const ids = await ingestion.run([sourceId]);
        console.log(JSON.stringify({ event: 'scheduled_tick_finished', runs: ids?.length }));
      },
    },
    { enabled: true, interval: 60000, logger },
  );
  console.log(JSON.stringify({ event: 'waiting_for_real_scheduler_interval', intervalMs: 60000 }));
  try {
    await until(
      async () =>
        (await db.ingestion_runs.count({ where: { source_id: sourceId, status: 'FAILED' } })) === 1,
      85000,
    );
  } catch (error) {
    console.error(
      JSON.stringify({
        event: 'scheduler_verification_timeout',
        runs: await db.ingestion_runs.findMany({ select: { status: true, error_summary: true } }),
        running: ingestion.isRunning(),
      }),
    );
    throw error;
  }
  const elapsedMs = Date.now() - started;
  stopSchedule();
  assert.ok(elapsedMs >= 60000);
  const failed = await db.ingestion_runs.findFirst({ where: { source_id: sourceId } });
  assert.equal(failed.error_summary, 'Source fetch or processing failed');
  assert.equal(failed.failed_count, 1);
  assert.equal((await request('/health/live')).status, 200);
  console.log(JSON.stringify({ event: 'real_interval_and_source_failure_passed', elapsedMs }));

  // Stop only this test's own database, leaving the running demo untouched.
  await docker('stop', '--time', '1', name);
  const unavailable = await request('/health/ready');
  assert.equal(unavailable.status, 503);
  assert.equal(unavailable.body.error.code, 'DATABASE_UNAVAILABLE');
  assert.ok(!JSON.stringify(unavailable.body).includes(password));
  assert.equal((await request('/health/live')).status, 200);
  assert.equal((await request('/content')).status, 503);
  const failures = [];
  let tick;
  const stopProbe = startScheduler(ingestion, {
    enabled: true,
    setTimer: (fn) => (tick = fn),
    clearTimer() {},
    logger: { error: (line) => failures.push(JSON.parse(line)) },
  });
  await tick();
  assert.deepEqual(failures, [{ event: 'scheduled_ingestion_failed' }]);
  assert.equal(ingestion.isRunning(), false);
  stopProbe();

  await docker('start', name);
  await until(async () => (await request('/health/ready')).status === 200);
  // Use an owned fixture, never fake records in the development collection.
  const source = await db.sources.findUnique({ where: { id: sourceId } });
  const candidates = [
    {
      title: 'Data center recovery verification',
      url: 'https://example.invalid/reliability',
      type: 'ARTICLE',
    },
  ];
  const recovered = await ingestSource(db, source, { candidates });
  assert.equal(recovered.status, 'COMPLETED');
  assert.equal(recovered.inserted_count, 1);
  assert.equal((await ingestSource(db, source, { candidates })).inserted_count, 0);
  assert.equal((await request('/content')).body.pagination.total, 1);
  // Verify the same scheduled job can run again after the database reconnects.
  assert.equal((await ingestion.run([sourceId])).length, 1);
  assert.equal(ingestion.isRunning(), false);
  console.log(
    JSON.stringify({
      event: 'database_outage_and_recovery_passed',
      readyDuringOutage: 503,
      liveDuringOutage: 200,
      restoredReady: 200,
      persistedRecords: 1,
      demoDatabaseTouched: false,
    }),
  );
} finally {
  stopSchedule?.();
  if (server) await new Promise((resolve) => server.close(resolve));
  await db?.$disconnect();
  await pool?.end();
  if (containerCreated) await docker('rm', '-f', '-v', name);
}

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startScheduler } from '../src/ingestion/scheduler.js';
import { createIngestion } from '../src/ingestion/service.js';

test('scheduler contains sync/async failures, logs safely and recovers on later ticks', async () => {
  let tick;
  let calls = 0;
  const errors = [];
  const stop = startScheduler(
    {
      run() {
        calls++;
        if (calls === 1) throw Error('postgresql://private-password');
        if (calls === 2) return Promise.reject(Error('secret upstream response'));
        return Promise.resolve();
      },
    },
    {
      enabled: true,
      setTimer: (fn) => (tick = fn),
      clearTimer() {},
      logger: { error: (line) => errors.push(JSON.parse(line)) },
    },
  );
  await tick();
  await tick();
  await tick();
  assert.equal(calls, 3);
  assert.deepEqual(errors, [
    { event: 'scheduled_ingestion_failed' },
    { event: 'scheduled_ingestion_failed' },
  ]);
  stop();
  await tick();
  assert.equal(calls, 3);
});

test('scheduler skips overlapping ticks and releases its guard after completion', async () => {
  let tick, complete;
  let calls = 0;
  const stop = startScheduler(
    {
      run: () => {
        calls++;
        return new Promise((resolve) => {
          complete = resolve;
        });
      },
    },
    { enabled: true, setTimer: (fn) => (tick = fn), clearTimer() {} },
  );
  const first = tick();
  await tick();
  assert.equal(calls, 1);
  complete();
  await first;
  const second = tick();
  assert.equal(calls, 2);
  complete();
  await second;
  stop();
});

test('manual and scheduled ingestion share a lock that recovers after database failure', async () => {
  let rejectRead;
  let reads = 0;
  const db = {
    sources: {
      findMany: () => {
        reads++;
        return new Promise((_, reject) => {
          rejectRead = reject;
        });
      },
    },
    $transaction: async () => [],
  };
  const manual = createIngestion(db);
  assert.equal(createIngestion(db), manual);
  const first = manual.run();
  assert.equal(await manual.enqueue(), null);
  assert.equal(reads, 1);
  rejectRead(Error('Database unavailable'));
  await assert.rejects(first, /unavailable/);
  assert.equal(manual.isRunning(), false);
  db.sources.findMany = async () => [];
  assert.deepEqual(await manual.run(), []);
  assert.equal(manual.isRunning(), false);
});

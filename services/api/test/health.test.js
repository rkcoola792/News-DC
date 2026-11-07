import { createPool, createDatabase, migrate } from '@newsdc/db';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from '../src/app.js';
const logger = { info() {}, error() {} };
async function request(db, path) {
  const server = createApp({ db, logger }).listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}${path}`);
    return {
      status: response.status,
      body: await response.json(),
      id: response.headers.get('x-request-id'),
    };
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}
test('liveness works when database fails and includes a request ID', async () => {
  const result = await request(
    {
      schema_migrations: {
        findMany: () => {
          throw Error('secret database url');
        },
      },
    },
    '/api/v1/health/live',
  );
  assert.equal(result.status, 200);
  assert.equal(result.body.status, 'ok');
  assert.ok(result.id);
});
test('readiness succeeds after database and migrations checks', async () => {
  const queries = [];
  const result = await request(
    {
      schema_migrations: {
        findMany: async (args) => {
          queries.push(args);
          return [
            { name: '001_foundation.sql' },
            { name: '002_taxonomy.sql' },
            { name: '003_fingerprint.sql' },
            { name: '004_ai_provider_limits.sql' },
            { name: '005_remove_ai_demo_caps.sql' },
            { name: '006_ai_cache_settings.sql' },
          ];
        },
      },
    },
    '/api/v1/health/ready',
  );
  assert.equal(result.status, 200);
  assert.equal(result.body.database, 'ready');
  assert.equal(queries.length, 1);
});
test('database failure returns safe 503 without leaked credentials', async () => {
  const result = await request(
    {
      schema_migrations: {
        findMany: async () => {
          throw Error('postgresql://secret');
        },
      },
    },
    '/api/v1/health/ready',
  );
  assert.equal(result.status, 503);
  assert.equal(result.body.error.code, 'DATABASE_UNAVAILABLE');
  assert.ok(!JSON.stringify(result.body).includes('secret'));
});
test('pending migrations prevent readiness', async () => {
  const result = await request(
    { schema_migrations: { findMany: async () => [] } },
    '/api/v1/health/ready',
  );
  assert.equal(result.status, 503);
});
test('unimplemented endpoints return consistent 404', async () => {
  const result = await request({}, '/api/v1/not-an-endpoint');
  assert.equal(result.status, 404);
  assert.equal(result.body.error.code, 'NOT_FOUND');
});

test(
  'real PostgreSQL readiness after migrations',
  {
    skip: !process.env.TEST_DATABASE_URL
      ? 'Set TEST_DATABASE_URL for real PostgreSQL verification'
      : false,
  },
  async () => {
    const pool = createPool(process.env.TEST_DATABASE_URL);
    const db = createDatabase(process.env.TEST_DATABASE_URL);
    try {
      await migrate(pool);
      const result = await request(db, '/api/v1/health/ready');
      assert.equal(result.status, 200);
      assert.equal(result.body.database, 'ready');
    } finally {
      await db.$disconnect();
      await pool.end();
    }
  },
);

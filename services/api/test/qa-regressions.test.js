import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from '../src/app.js';
import { filters, listContent } from '../src/content/service.js';
import { publicReadLimit } from '../src/security.js';

test('recommendations bound candidates and recover out-of-range pages', async () => {
  let query;
  const row = {
    id: 'x',
    created_at: new Date(),
    published_at: new Date(),
    content_category_map: [],
    content_tag_map: [],
  };
  const db = {
    content_items: {
      findMany: async (args) => {
        query = args;
        return [row];
      },
    },
  };
  const result = await listContent(db, filters.parse({ page: 100000 }), 'trending');
  assert.equal(query.take, 1000);
  assert.ok(query.orderBy);
  assert.equal(result.pagination.page, 1);
  assert.equal(result.data.length, 1);
  assert.equal(result.ranking.candidateLimit, 1000);
});

test('ordinary lists recover to their last valid page', async () => {
  const queries = [];
  const db = {
    content_items: {
      findMany: (args) => {
        queries.push(args);
        return Promise.resolve([]);
      },
      count: async () => 11,
    },
    $transaction: (calls) => Promise.all(calls),
  };
  const result = await listContent(db, filters.parse({ page: 100000, limit: 10 }));
  assert.equal(result.pagination.page, 2);
  assert.equal(queries.at(-1).skip, 10);
});

test('valid operator bypasses failed-attempt lockout; invalid requests stay throttled', async () => {
  const app = createApp({
    db: {},
    adminKey: 'disposable-test-key',
    logger: { info() {}, error() {} },
  });
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    for (let i = 0; i < 30; i++)
      assert.equal((await fetch(base + '/api/v1/admin/unknown')).status, 401);
    assert.equal((await fetch(base + '/api/v1/admin/unknown')).status, 429);
    const response = await fetch(base + '/api/v1/admin/unknown', {
      headers: { authorization: 'Bearer disposable-test-key' },
    });
    assert.equal(response.status, 404);
    assert.equal(response.headers.get('x-frame-options'), 'DENY');
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    assert.match(response.headers.get('content-security-policy'), /frame-ancestors 'none'/);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('public request limits return a retry interval', () => {
  const middleware = publicReadLimit({ limit: 2 });
  let passed = 0,
    status,
    retry;
  const response = {
    set: (_name, value) => {
      retry = value;
    },
    status: (value) => {
      status = value;
      return response;
    },
    json() {},
  };
  for (let i = 0; i < 3; i++) middleware({ ip: 'test' }, response, () => passed++);
  assert.equal(passed, 2);
  assert.equal(status, 429);
  assert.ok(Number(retry) > 0);
});

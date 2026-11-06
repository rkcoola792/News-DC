import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import { createPool, createDatabase, migrate } from '@newsdc/db';
import { createApp } from '../src/app.js';
import { seedSources, sourceDefinitions } from '../src/ingestion/sources.js';
import { ingestSource } from '../src/ingestion/service.js';
const logger = { info() {}, error() {} };
test(
  'non-AI content and ingestion vertical slice',
  { skip: !process.env.TEST_DATABASE_URL ? 'Set TEST_DATABASE_URL' : false },
  async (t) => {
    const pool = createPool(process.env.TEST_DATABASE_URL),
      client = await pool.connect();
    const schema = 'test_' + randomUUID().replaceAll('-', '');
    const db = createDatabase(process.env.TEST_DATABASE_URL, { schema });
    let server;
    try {
      await client.query(`CREATE SCHEMA ${schema}`);
      await client.query(`SET search_path TO ${schema}, public`);
      await migrate({
        connect: async () => ({ query: (...a) => client.query(...a), release() {} }),
      });
      await seedSources(db);
      const source = await db.sources.findUnique({ where: { id: sourceDefinitions[1].id } });
      const candidates = [
        {
          title: 'Liquid cooling engineering',
          tags: [' Cooling ', 'COOLING', 'GPU'],
          url: 'https://publisher.invalid/cooling?utm_source=rss',
          type: 'ARTICLE',
          description: 'Cooling infrastructure design',
          publishedAt: new Date().toISOString(),
        },
        {
          title: 'GPU compute research',
          url: 'https://publisher.invalid/gpu',
          type: 'RESEARCH',
          description: 'GPU cluster utilization',
          metadata: { doi: 'fixture-doi' },
        },
        {
          title: 'Power and energy discussion',
          url: 'https://publisher.invalid/power',
          type: 'DISCUSSION',
          description: 'Data center power',
          metadata: { points: 10 },
        },
        {
          title: 'Liquid cooling video',
          url: 'https://publisher.invalid/video',
          type: 'VIDEO',
          description: 'Cooling metadata only',
          durationSeconds: 300,
        },
      ];
      let run;
      await t.test('ingestion persists four formats and records a successful run', async () => {
        run = await ingestSource(db, source, { candidates });
        assert.equal(run.inserted_count, 4);
        assert.equal(run.status, 'COMPLETED');
      });
      await t.test('repeat ingestion deduplicates canonical URLs and fingerprints', async () => {
        const repeat = await ingestSource(db, source, {
          candidates: [
            ...candidates,
            { ...candidates[0], url: 'https://publisher.invalid/renamed' },
          ],
        });
        assert.equal(repeat.inserted_count, 0);
        assert.equal(repeat.skipped_count, 5);
        assert.equal(await db.content_items.count(), 4);
      });
      await t.test(
        'tag relationships survive repeats, preserve omitted tags and clear explicit empty tags',
        async () => {
          const item = await db.content_items.findFirst({ where: { title: candidates[0].title } });
          const names = async () =>
            (
              await db.content_tag_map.findMany({
                where: { content_id: item.id },
                include: { tags: true },
              })
            )
              .map((m) => m.tags.name)
              .sort();
          assert.deepEqual(await names(), ['cooling', 'gpu']);
          assert.equal(await db.tags.count({ where: { name: 'cooling' } }), 1);
          await ingestSource(db, source, { candidates: [{ ...candidates[0], tags: undefined }] });
          assert.deepEqual(await names(), ['cooling', 'gpu']);
          const rejected = await ingestSource(db, source, {
            candidates: [{ ...candidates[0], tags: [42] }],
          });
          assert.equal(rejected.failed_count, 1);
          assert.deepEqual(await names(), ['cooling', 'gpu']);
          await ingestSource(db, source, { candidates: [{ ...candidates[0], tags: ['Power'] }] });
          assert.deepEqual(await names(), ['power']);
          await ingestSource(db, source, { candidates: [{ ...candidates[0], tags: [] }] });
          assert.deepEqual(await names(), []);
          await ingestSource(db, source, { candidates: [candidates[0]] });
          assert.deepEqual(await names(), ['cooling', 'gpu']);
        },
      );
      await t.test('invalid candidates are counted with a safe failure reason', async () => {
        const invalid = await ingestSource(db, source, {
          candidates: [{ title: '', url: 'javascript:bad', type: 'ARTICLE' }],
        });
        assert.equal(invalid.failed_count, 1);
        assert.equal(invalid.status, 'FAILED');
      });
      server = createApp({ db, adminKey: 'test-operator-key', logger }).listen(0, '127.0.0.1');
      await once(server, 'listening');
      const base = `http://127.0.0.1:${server.address().port}/api/v1`;
      async function get(path, options = {}) {
        const response = await fetch(base + path, options);
        return { status: response.status, body: await response.json() };
      }
      let first;
      await t.test('pagination is bounded and has no duplicate items across pages', async () => {
        first = await get('/content?limit=2&page=1');
        const second = await get('/content?limit=2&page=2');
        assert.equal(first.status, 200);
        assert.equal(first.body.pagination.total, 4);
        assert.equal(new Set([...first.body.data, ...second.body.data].map((x) => x.id)).size, 4);
      });
      await t.test(
        'PostgreSQL full text and combined filters return expected formats',
        async () => {
          const result = await get('/search?q=cooling&type=VIDEO&category=cooling');
          assert.equal(result.status, 200);
          assert.equal(result.body.data.length, 1);
          assert.equal(result.body.data[0].contentType, 'VIDEO');
          assert.equal((await get('/content?minQuality=1')).body.data.length, 0);
          assert.equal((await get('/content?limit=101')).status, 400);
        },
      );
      await t.test(
        'details, source attribution, related content and categories are real',
        async () => {
          const cooling = (await get('/content?category=cooling')).body.data[0];
          const detail = await get(`/content/${cooling.id}`);
          assert.equal(detail.status, 200);
          assert.ok(detail.body.data.publisher.domain);
          assert.ok(detail.body.data.url.startsWith('https://'));
          assert.equal(detail.body.data.ai.summary, null);
          assert.equal((await get(`/content/${cooling.id}/related`)).body.data.length, 1);
          assert.equal((await get('/topics')).body.data.length, 14);
          assert.equal((await get('/content/not-a-uuid')).status, 400);
        },
      );
      await t.test('source tags round-trip through list, detail and JSON export', async () => {
        const list = await get('/content?type=ARTICLE');
        assert.deepEqual(list.body.data[0].tags.map((t) => t.name).sort(), ['cooling', 'gpu']);
        const detail = await get(`/content/${list.body.data[0].id}`);
        assert.deepEqual(detail.body.data.tags, list.body.data[0].tags);
        const exported = await get('/exports/content.json?type=ARTICLE');
        assert.deepEqual(exported.body.data[0].tags, detail.body.data.tags);
      });
      await t.test('personalized feed responds to validated topic preferences', async () => {
        const result = await get('/recommendations/for-you?topics=ai-compute-gpus');
        assert.equal(result.status, 200);
        assert.ok(result.body.data[0].title.includes('GPU'));
        const trend = await get('/recommendations/trending');
        assert.equal(trend.status, 200);
        assert.equal(trend.body.ranking.ai, false);
      });
      await t.test(
        'admin data and writes require server-side authorization; AI is disabled',
        async () => {
          assert.equal((await get('/admin/metrics')).status, 401);
          const metrics = await get('/admin/metrics', {
            headers: { Authorization: 'Bearer test-operator-key' },
          });
          assert.equal(metrics.body.total, 4);
          assert.equal(
            (
              await get('/assistant/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: 'test' }),
              })
            ).body.error.code,
            'AI_DISABLED',
          );
          const response = await fetch(base + '/exports/content.md');
          assert.equal(response.status, 200);
          assert.ok((await response.text()).includes('https://publisher.invalid'));
          const exported = await get('/exports/content.json');
          assert.equal(exported.body.data.length, 4);
        },
      );

      await t.test('operator source controls and metadata imports are validated', async () => {
        const headers = {
          Authorization: 'Bearer test-operator-key',
          'Content-Type': 'application/json',
        };
        const disabled = await get(`/admin/sources/${source.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ enabled: false }),
        });
        assert.equal(disabled.status, 200);
        assert.equal(disabled.body.data.is_enabled, false);
        const imported = await get('/admin/content/import', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            sourceId: source.id,
            items: [
              {
                title: 'Imported research metadata',
                type: 'RESEARCH',
                url: 'https://publisher.invalid/import',
                metadata: { doi: 'fixture' },
              },
            ],
          }),
        });
        assert.equal(imported.status, 200);
        assert.equal(imported.body.data.inserted_count, 1);
        assert.equal(await db.content_items.count(), 5);
      });
      await t.test(
        'manual ingestion returns persistent run IDs and records source failure',
        async () => {
          await db.sources.update({
            where: { id: source.id },
            data: { is_enabled: true, endpoint_url: 'https://unapproved.invalid/fixture' },
          });
          const headers = {
            Authorization: 'Bearer test-operator-key',
            'Content-Type': 'application/json',
          };
          const queued = await get('/admin/ingestion/run', {
            method: 'POST',
            headers,
            body: JSON.stringify({ sourceIds: [source.id] }),
          });
          assert.equal(queued.status, 202);
          assert.equal(queued.body.runIds.length, 1);
          let detail;
          for (let i = 0; i < 30; i++) {
            detail = await get(`/admin/ingestion/runs/${queued.body.runIds[0]}`, { headers });
            if (detail.body.data.status === 'FAILED') break;
            await new Promise((resolve) => setTimeout(resolve, 10));
          }
          assert.equal(detail.body.data.status, 'FAILED');
          assert.equal(detail.body.data.failed_count, 1);
        },
      );
    } finally {
      if (server) await new Promise((resolve) => server.close(resolve));
      await db.$disconnect();
      await client.query('SET search_path TO public');
      await client.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
      client.release();
      await pool.end();
    }
  },
);

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import {
  createPool,
  createDatabase,
  migrate,
  createContent,
  getContentById,
} from '../src/index.js';
import { topicOptions } from '@newsdc/shared/taxonomy';
test('pool configuration rejects absent or non-PostgreSQL URLs', () => {
  assert.throws(() => createPool(''), /required/);
  assert.throws(() => createPool('https://example.com'), /PostgreSQL/);
});
test(
  'PostgreSQL foundation integration',
  {
    skip: !process.env.TEST_DATABASE_URL
      ? 'Set TEST_DATABASE_URL to a dedicated PostgreSQL test database'
      : false,
  },
  async (t) => {
    const pool = createPool(process.env.TEST_DATABASE_URL);
    const client = await pool.connect();
    const schema = 'test_' + randomUUID().replaceAll('-', '');
    const db = createDatabase(process.env.TEST_DATABASE_URL, { schema });
    try {
      await client.query(`CREATE SCHEMA ${schema}`);
      await client.query(`SET search_path TO ${schema}, public`);
      const scoped = {
        connect: async () => ({ query: (...args) => client.query(...args), release() {} }),
      };
      await t.test('migrations apply and a repeated run is a no-op', async () => {
        assert.equal((await migrate(scoped)).length, 5);
        assert.deepEqual(await migrate(scoped), []);
      });
      await t.test('all controlled taxonomy rows match shared definitions', async () => {
        const rows = await db.categories.findMany({
          select: { slug: true, name: true },
          orderBy: { slug: 'asc' },
        });
        assert.deepEqual(
          rows,
          topicOptions
            .map((x) => ({ slug: x.id, name: x.name }))
            .sort((a, b) => a.slug.localeCompare(b.slug)),
        );
      });
      await t.test('four content types round-trip without invented optional metadata', async () => {
        for (const contentType of ['ARTICLE', 'VIDEO', 'RESEARCH', 'DISCUSSION']) {
          const item = await createContent(db, {
            contentType,
            title: `Fixture ${contentType}`,
            url: `https://example.invalid/${contentType}`,
            metadata: { fixture: true },
          });
          const stored = await getContentById(db, item.id);
          assert.equal(stored.content_type, contentType);
          assert.equal(stored.ai_status, 'PENDING');
          assert.equal(stored.author, null);
          assert.equal(stored.ai_summary, null);
          assert.equal(stored.duration_seconds, null);
          assert.deepEqual(stored.metadata, { fixture: true });
        }
        assert.equal(await getContentById(db, randomUUID()), null);
      });
      await t.test(
        'unique canonical URL, enums, ranges and foreign keys are enforced',
        async () => {
          const item = await createContent(db, {
            contentType: 'ARTICLE',
            title: 'Fixture',
            url: 'https://example.invalid/a',
            canonicalUrl: 'https://example.invalid/a',
          });
          await assert.rejects(
            createContent(db, {
              contentType: 'ARTICLE',
              title: 'Duplicate',
              url: 'https://example.invalid/a?x=1',
              canonicalUrl: item.canonical_url,
            }),
            { code: 'P2002' },
          );
          await assert.rejects(
            createContent(db, {
              contentType: 'INVALID',
              title: 'Invalid',
              url: 'https://example.invalid/x',
            }),
            { code: 'P2039' },
          );
          await assert.rejects(
            createContent(db, {
              contentType: 'VIDEO',
              title: 'Invalid',
              url: 'https://example.invalid/x',
              durationSeconds: -1,
            }),
            { code: 'P2039' },
          );
          await assert.rejects(
            createContent(db, {
              contentType: 'ARTICLE',
              title: 'Invalid FK',
              url: 'https://example.invalid/fk',
              publisherId: randomUUID(),
            }),
            { code: 'P2003' },
          );
          await assert.rejects(
            db.content_items.update({ where: { id: item.id }, data: { quality_score: 101 } }),
            { code: 'P2039' },
          );
        },
      );
      await t.test('generated full-text index tracks updates', async () => {
        const item = await createContent(db, {
          contentType: 'ARTICLE',
          title: 'Liquid cooling fixture',
          url: 'https://example.invalid/search',
        });
        const result = await client.query(
          "SELECT id FROM content_items WHERE id=$1 AND search_vector @@ plainto_tsquery('english','cooling')",
          [item.id],
        );
        assert.equal(result.rowCount, 1);
        await db.content_items.update({
          where: { id: item.id },
          data: { title: 'Networking fixture' },
        });
        const updated = await client.query(
          "SELECT id FROM content_items WHERE id=$1 AND search_vector @@ plainto_tsquery('english','networking')",
          [item.id],
        );
        assert.equal(updated.rowCount, 1);
      });
    } finally {
      await db.$disconnect();
      await client.query('SET search_path TO public');
      await client.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
      client.release();
      await pool.end();
    }
  },
);

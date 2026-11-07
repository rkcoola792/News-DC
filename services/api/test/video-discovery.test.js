import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fetchCandidates, sourceDefinitions } from '../src/ingestion/sources.js';

test('focused HN video discovery deduplicates links and preserves more than five videos', async () => {
  const source = sourceDefinitions.find((s) => s.config?.adapter === 'hn-video');
  const hits = Array.from({ length: 25 }, (_, i) => ({
    title: `Data center tour ${i} [video]`,
    url: `https://www.youtube.com/watch?v=${String(i).padStart(11, '0')}`,
    objectID: String(i),
    created_at: '2026-11-07T00:00:00Z',
  }));
  hits.splice(1, 0, { ...hits[0], url: 'https://youtu.be/00000000000' });
  hits.splice(2, 0, { title: 'Data center article', url: 'https://publisher.invalid/article' });
  let metadataCalls = 0;
  const rows = await fetchCandidates(source, async (url, options) => {
    assert.equal(options.redirect, 'error');
    if (url === source.endpoint_url) return Response.json({ hits });
    assert.equal(new URL(url).origin, 'https://www.youtube.com');
    metadataCalls++;
    return Response.json({ title: 'Data center tour', author_name: 'Channel' });
  });
  assert.equal(rows.length, 20);
  assert.equal(metadataCalls, 20);
  assert.equal(new Set(rows.map((row) => row.url)).size, 20);
  assert.ok(rows.every((row) => row.type === 'VIDEO' && row.publishedAt === null));
});

test('focused video discovery supports empty results and safe metadata failure', async () => {
  const source = sourceDefinitions.find((s) => s.config?.adapter === 'hn-video');
  assert.deepEqual(await fetchCandidates(source, async () => Response.json({ hits: [] })), []);
  const rows = await fetchCandidates(source, async (url) =>
    url === source.endpoint_url
      ? Response.json({
          hits: [{ title: 'Data center tour', url: 'https://youtu.be/abcdefghijk' }],
        })
      : new Response('', { status: 404 }),
  );
  assert.equal(rows[0].type, 'VIDEO');
  assert.equal(rows[0].metadata.videoMetadataStatus, 'UPSTREAM_404');
  assert.equal(rows[0].author, null);
});

import { startScheduler } from '../src/ingestion/scheduler.js';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeCandidate, canonicalize, classifyTopics } from '../src/ingestion/normalize.js';
import { fetchCandidates, sourceDefinitions } from '../src/ingestion/sources.js';
import { filters } from '../src/content/service.js';
test('normalization preserves originals, strips HTML, handles missing optional fields and removes tracking only', () => {
  const row = normalizeCandidate({
    title: ' <b>Liquid cooling</b> ',
    url: 'https://EXAMPLE.com/story?utm_source=mail&b=2&a=1#section',
    type: 'ARTICLE',
  });
  assert.equal(row.title, 'Liquid cooling');
  assert.equal(row.canonicalUrl, 'https://example.com/story?a=1&b=2');
  assert.ok(row.url.includes('utm_source'));
  assert.equal(row.publishedAt, null);
  assert.equal(row.fingerprint.length, 64);
  assert.ok(classifyTopics(row.title).includes('cooling'));
  assert.equal(canonicalize('https://example.com/a?x=1'), 'https://example.com/a?x=1');
});
test('invalid dates, types, URLs, titles and duration are rejected', () => {
  const base = { title: 'Valid', url: 'https://example.invalid/a', type: 'VIDEO' };
  for (const change of [
    { title: '' },
    { url: 'javascript:alert(1)' },
    { type: 'OTHER' },
    { publishedAt: 'not-a-date' },
    { durationSeconds: -1 },
  ])
    assert.throws(() => normalizeCandidate({ ...base, ...change }));
});
test('API and RSS adapters return supported metadata without transcripts', async () => {
  const api = await fetchCandidates(
    sourceDefinitions[0],
    async () =>
      new Response(
        JSON.stringify({
          hits: [
            {
              title: 'Data center cooling',
              url: 'https://example.invalid/a',
              objectID: '1',
              created_at: '2026-11-01T00:00:00Z',
              points: 3,
            },
          ],
        }),
      ),
  );
  assert.equal(api[0].type, 'DISCUSSION');
  assert.equal(api[0].metadata.points, 3);
  const rss = await fetchCandidates(
    sourceDefinitions[1],
    async () =>
      new Response(
        '<rss><channel><item><title>Cooling</title><link>https://example.invalid/a</link><description>Publisher description</description></item></channel></rss>',
      ),
  );
  assert.equal(rss[0].type, 'ARTICLE');
  assert.equal(rss[0].description, 'Publisher description');
  assert.equal(rss[0].publishedAt, null);
  await assert.rejects(
    fetchCandidates({ ...sourceDefinitions[0], endpoint_url: 'https://unapproved.invalid' }),
    /approved/,
  );
});
test('query validation rejects invalid pagination, IDs, score ranges and date ranges', () => {
  for (const input of [
    { page: 0 },
    { limit: 101 },
    { ids: 'not-a-uuid' },
    { minQuality: 101 },
    { from: '2026-11-05', to: '2026-10-01' },
    { topics: 'unknown' },
  ])
    assert.equal(filters.safeParse(input).success, false);
  assert.equal(filters.parse({ q: 'cooling' }).limit, 20);
});

test('scheduler honors enabled flag, invokes the job and clears its timer', async () => {
  let callback,
    calls = 0,
    cleared = false;
  const stop = startScheduler(
    {
      run: async () => {
        calls++;
      },
    },
    {
      enabled: true,
      interval: 60000,
      setTimer: (fn) => {
        callback = fn;
        return 7;
      },
      clearTimer: (id) => {
        assert.equal(id, 7);
        cleared = true;
      },
    },
  );
  callback();
  await Promise.resolve();
  assert.equal(calls, 1);
  stop();
  assert.equal(cleared, true);
  startScheduler(
    { run() {} },
    {
      enabled: false,
      setTimer: () => {
        throw Error('must stay disabled');
      },
    },
  )();
  assert.throws(() => startScheduler({}, { interval: 1 }), /at least/);
});

test('optional tags normalize case/spacing/HTML and deduplicate without inventing values', () => {
  const base = { title: 'Data center tags', url: 'https://example.invalid/tags', type: 'ARTICLE' };
  assert.equal(normalizeCandidate(base).tags, undefined);
  assert.deepEqual(normalizeCandidate({ ...base, tags: [] }).tags, []);
  assert.deepEqual(
    normalizeCandidate({
      ...base,
      tags: [' Cooling ', 'COOLING', '<b>GPU</b>', 'Liquid   Cooling'],
    }).tags,
    ['cooling', 'gpu', 'liquid cooling'],
  );
  for (const tags of [
    'cooling',
    [42],
    [null],
    [{}],
    ['  '],
    ['x'.repeat(81)],
    Array.from({ length: 31 }, (_, i) => 'tag' + i),
  ])
    assert.throws(() => normalizeCandidate({ ...base, tags }));
});
test('RSS and Atom category structures become source tags; missing categories remain absent', async () => {
  const rss = await fetchCandidates(
    sourceDefinitions[1],
    async () =>
      new Response(
        '<rss><channel><item><title>Cooling</title><link>https://example.invalid/tagged</link><category>Cooling</category><category domain="topics">GPU</category></item></channel></rss>',
      ),
  );
  assert.deepEqual(normalizeCandidate(rss[0]).tags, ['cooling', 'gpu']);
  const atom = await fetchCandidates(
    sourceDefinitions[1],
    async () =>
      new Response(
        '<feed><entry><title>Cooling</title><link href="https://example.invalid/atom"/><category term="Research"/></entry></feed>',
      ),
  );
  assert.deepEqual(normalizeCandidate(atom[0]).tags, ['research']);
});

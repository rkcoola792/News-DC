import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createPool, createDatabase, migrate } from '@newsdc/db';
import { createAssistant, citedTask, queryGroups } from '../src/ai/assistant.js';
import { createTrends } from '../src/ai/trends.js';
import { createAutomation } from '../src/ai/automation.js';
import { createBackfill } from '../src/ingestion/backfill.js';
import { youtubeId, videoCandidate } from '../src/ingestion/video.js';
import {
  sourceDefinitions,
  seedSources,
  researchPageURL,
  fetchCandidates,
} from '../src/ingestion/sources.js';
import { ingestSource } from '../src/ingestion/service.js';

test('YouTube metadata uses a fixed endpoint, degrades safely and never invents dates or transcripts', async () => {
  for (const url of [
    'https://youtube.com.evil.invalid/watch?v=abcdefghijk',
    'https://user:pass@youtube.com/watch?v=abcdefghijk',
    'file:///abcdefghijk',
    'https://example.invalid/abcdefghijk',
  ])
    assert.equal(youtubeId(url), null);
  const candidate = {
    title: 'Data center cooling video',
    url: 'https://youtu.be/abcdefghijk',
    publishedAt: '2026-11-01T00:00:00Z',
    author: 'HN submitter',
    description: 'Discovery post, not a transcript.',
  };
  const converted = await videoCandidate(candidate, async (url, options) => {
    assert.equal(new URL(url).hostname, 'www.youtube.com');
    assert.equal(options.redirect, 'error');
    return new Response(
      JSON.stringify({
        title: 'Cooling tour',
        author_name: 'Facility channel',
        thumbnail_url: 'https://i.ytimg.com/vi/abcdefghijk/hqdefault.jpg',
        author_url: 'https://www.youtube.com/@facility',
      }),
    );
  });
  assert.equal(converted.type, 'VIDEO');
  assert.equal(converted.publishedAt, null);
  assert.equal(converted.author, 'Facility channel');
  assert.equal(converted.metadata.discoveredAt, candidate.publishedAt);
  assert.equal(converted.metadata.descriptionOrigin, 'discovery-post-text');
  assert.equal(converted.contentText, undefined);
  const failed = await videoCandidate(candidate, async () => new Response('', { status: 404 }));
  assert.equal(failed.type, 'VIDEO');
  assert.equal(failed.author, null);
  assert.equal(failed.metadata.videoMetadataStatus, 'UPSTREAM_404');
  const poisoned = await videoCandidate(
    candidate,
    async () =>
      new Response(
        JSON.stringify({
          title: 'Tour',
          author_name: 'Channel',
          thumbnail_url: 'https://evil.invalid/image.jpg',
        }),
      ),
  );
  assert.equal(poisoned.thumbnailUrl, null);
});

test('assistant rejects invented citations, unsupported answers and model URLs', () => {
  const task = citedTask('Cooling?', [{ id: 'S1' }]);
  const value = {
    insufficientEvidence: false,
    paragraphs: [{ text: 'A source describes cooling measurements.', sourceIds: ['S1'] }],
    limitations: 'Abstract only.',
  };
  assert.equal(task.validate(value).paragraphs.length, 1);
  assert.throws(() =>
    task.validate({ ...value, paragraphs: [{ ...value.paragraphs[0], sourceIds: ['S99'] }] }),
  );
  assert.throws(() => task.validate({ ...value, insufficientEvidence: true }));
  assert.throws(() =>
    task.validate({
      ...value,
      paragraphs: [
        { ...value.paragraphs[0], text: 'Visit https://invented.invalid for the result.' },
      ],
    }),
  );
  assert.deepEqual(queryGroups('GPU utilization'), queryGroups('GPUs utilisation'));
});

test('automation persists pause, respects interactive work and records trend failures', async () => {
  let value = { paused: true },
    runs = 0,
    interactive = false;
  const db = {
    app_settings: {
      findUnique: async () => ({ value }),
      upsert: async (args) => {
        value = args.update.value;
      },
    },
    content_items: { findMany: async () => [], groupBy: async () => [] },
  };
  const worker = createAutomation(
    db,
    { isBusy: () => false, run: async () => runs++ },
    { isEnabled: () => true, isBusy: () => false },
    { isBusy: () => interactive },
    {
      isBusy: () => false,
      refresh: async () => {
        throw Object.assign(Error(), { code: 'UPSTREAM_TEST' });
      },
    },
    { enabled: true, logger: { error() {} } },
  );
  await worker.tick();
  assert.equal((await worker.status()).paused, true);
  assert.equal(runs, 0);
  interactive = true;
  await worker.pause(false);
  await worker.tick();
  assert.equal((await worker.status()).lastError, null);
  interactive = false;
  await worker.tick();
  assert.equal((await worker.status()).lastError, 'UPSTREAM_TEST');
});

test('backfill prevents overlapping starts and retains interrupted progress', async () => {
  let value, release;
  const wait = new Promise((resolve) => {
    release = resolve;
  });
  const db = {
    app_settings: {
      findUnique: async () => ({ value }),
      upsert: async (args) => {
        value = structuredClone(args.update.value);
      },
    },
    sources: {
      findUnique: async () => {
        await wait;
        return { ...sourceDefinitions[2], is_enabled: true };
      },
    },
  };
  const service = createBackfill(db, { wake() {} }, console, {
    ingest: async () => ({
      id: 'run',
      status: 'COMPLETED',
      inserted_count: 2,
      skipped_count: 0,
      failed_count: 0,
    }),
  });
  const first = service.start(1);
  await assert.rejects(service.start(1), { code: 'AI_BUSY' });
  release();
  await first;
  while (service.isBusy()) await new Promise((resolve) => setTimeout(resolve, 5));
  assert.equal((await service.status()).inserted, 2);
  value = { status: 'RUNNING', page: 2 };
  await service.recover();
  assert.equal((await service.status()).status, 'FAILED');
  assert.equal(value.page, 2);
  assert.throws(() => researchPageURL(51));
  assert.throws(() => researchPageURL(600));
  let calls = 0;
  await assert.rejects(
    fetchCandidates(
      { ...sourceDefinitions[2], endpoint_url: researchPageURL(50) + '&evil=1' },
      async () => {
        calls++;
      },
    ),
  );
  assert.equal(calls, 0);
});

test(
  'assistant and trends persist source-grounded cached results in PostgreSQL',
  { skip: !process.env.TEST_DATABASE_URL ? 'Set TEST_DATABASE_URL' : false },
  async (t) => {
    const pool = createPool(process.env.TEST_DATABASE_URL),
      client = await pool.connect(),
      schema = 'assistant_' + randomUUID().replaceAll('-', ''),
      db = createDatabase(process.env.TEST_DATABASE_URL, { schema });
    let calls = 0,
      mode = 'answer';
    const providers = {
      isEnabled: () => true,
      isBusy: () => false,
      generate: async (task) => {
        calls++;
        const input = JSON.parse(task.input);
        if (mode === 'bad')
          return {
            value: {
              insufficientEvidence: false,
              paragraphs: [{ text: 'Invented source is not allowed.', sourceIds: ['S99'] }],
              limitations: '',
            },
          };
        if (mode === 'failure') throw Error('private provider error');
        if (mode === 'trends')
          return {
            provider: 'gemini',
            model: 'test',
            value: {
              themes: [
                {
                  slug: input[0].slug,
                  summary:
                    'These source examples discuss liquid cooling measurements in data centers.',
                  sourceIds: [input[0].sources[0].contentId],
                },
              ],
            },
          };
        return {
          provider: 'gemini',
          model: 'test',
          value: {
            insufficientEvidence: false,
            paragraphs: [
              {
                text: 'The indexed abstracts describe liquid cooling measurements in data centers.',
                sourceIds: [input.sources[0].id],
              },
            ],
            limitations: 'Available abstracts only.',
          },
        };
      },
    };
    try {
      await client.query(`CREATE SCHEMA ${schema}`);
      await client.query(`SET search_path TO ${schema}, public`);
      await migrate({
        connect: async () => ({ query: (...args) => client.query(...args), release() {} }),
      });
      await seedSources(db);
      const source = await db.sources.findUnique({ where: { id: sourceDefinitions[2].id } });
      const description =
        'Liquid cooling measurements in data centers compare power use and operating temperatures across several facility configurations. The available abstract reports experimental methods and limitations for interpreting the measured facility efficiency.';
      await ingestSource(db, source, {
        candidates: [
          {
            title: 'Data center liquid cooling measurements',
            type: 'RESEARCH',
            url: 'https://example.invalid/cooling-one',
            description,
            publishedAt: new Date().toISOString(),
          },
          {
            title: 'Data center cooling comparison',
            type: 'RESEARCH',
            url: 'https://example.invalid/cooling-two',
            description,
            publishedAt: new Date().toISOString(),
          },
        ],
      });
      const assistant = createAssistant(db, providers);
      await t.test('unmatched retrieval and filters make no provider calls', async () => {
        assert.equal(
          (await assistant.ask({ question: 'Quantum giraffe' })).insufficientEvidence,
          true,
        );
        assert.equal(
          (
            await assistant.ask({
              question: 'Liquid cooling',
              filters: { contentTypes: ['VIDEO'] },
            })
          ).retrieval.count,
          0,
        );
        assert.equal(calls, 0);
      });
      await t.test(
        'citations resolve to stored URLs and unchanged question reuses persisted output',
        async () => {
          const answer = await assistant.ask({ question: 'Liquid cooling' });
          assert.equal(answer.sources.length, 1);
          assert.match(answer.answer, /\[1\]/);
          assert.match(answer.sources[0].url, /example.invalid/);
          assert.equal(answer.sources[0].scope, 'abstract-only');
          assert.equal((await assistant.ask({ question: 'Liquid cooling' })).cached, true);
          assert.equal(calls, 1);
          const recreated = createAssistant(db, providers);
          assert.equal((await recreated.ask({ question: 'Liquid cooling' })).cached, true);
          assert.equal(calls, 1);
        },
      );
      await t.test(
        'changed evidence invalidates answer cache and provider failure remains retryable',
        async () => {
          await db.content_items.updateMany({
            data: { description: description + ' Updated measured cooling evidence.' },
          });
          assert.equal((await assistant.ask({ question: 'Liquid cooling' })).cached, false);
          assert.equal(calls, 2);
          mode = 'bad';
          await assert.rejects(assistant.ask({ question: 'Power cooling' }));
          assert.equal(assistant.isBusy(), false);
          mode = 'failure';
          await assert.rejects(assistant.ask({ question: 'Facility cooling' }));
          assert.equal(assistant.isBusy(), false);
        },
      );
      await t.test(
        'trend reads never call a model; refresh is cached and links indexed sources',
        async () => {
          mode = 'trends';
          const trends = createTrends(db, providers),
            before = calls;
          const status = await trends.status();
          assert.equal(calls, before);
          assert.equal(status.topics[0].currentCount, 2);
          const report = await trends.refresh();
          assert.equal(report.themes[0].sources.length, 1);
          assert.match(report.themes[0].sources[0].url, /example.invalid/);
          assert.equal((await trends.refresh()).cached, true);
          assert.equal(calls, before + 1);
          assert.equal((await trends.status()).report.provider, 'gemini');
        },
      );
      await t.test(
        'existing discovery record becomes VIDEO without retaining the submitter as channel or inventing a publication date',
        async () => {
          const hn = await db.sources.findUnique({ where: { id: sourceDefinitions[0].id } }),
            url = 'https://youtu.be/abcdefghijk';
          await ingestSource(db, hn, {
            candidates: [
              {
                title: 'Data center cooling video',
                url,
                type: 'DISCUSSION',
                author: 'HN submitter',
                publishedAt: new Date().toISOString(),
              },
            ],
          });
          const before = await db.content_items.findFirst({ where: { url } });
          const video = await videoCandidate(
            { title: 'Data center cooling video', url, publishedAt: new Date().toISOString() },
            async () => new Response('', { status: 404 }),
          );
          await ingestSource(db, hn, { candidates: [video] });
          const after = await db.content_items.findUnique({ where: { id: before.id } });
          assert.equal(after.content_type, 'VIDEO');
          assert.equal(after.author, null);
          assert.equal(after.published_at, null);
          assert.equal(after.url, 'https://www.youtube.com/watch?v=abcdefghijk');
        },
      );
    } finally {
      await db.$disconnect();
      await client.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
      client.release();
      await pool.end();
    }
  },
);

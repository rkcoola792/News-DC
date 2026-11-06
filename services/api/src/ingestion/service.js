import { normalizeCandidate, classifyTopics, isRelevantMetadata } from './normalize.js';
import { fetchCandidates } from './sources.js';
export async function ingestSource(
  db,
  source,
  { fetcher = fetch, candidates: suppliedCandidates, runId } = {},
) {
  const run = runId
    ? await db.ingestion_runs.update({ where: { id: runId }, data: { status: 'RUNNING' } })
    : await db.ingestion_runs.create({ data: { source_id: source.id, status: 'RUNNING' } });
  let fetched = 0,
    inserted = 0,
    skipped = 0,
    failed = 0;
  const reasons = [];
  try {
    const candidates = suppliedCandidates ?? (await fetchCandidates(source, fetcher));
    fetched = candidates.length;
    for (const raw of candidates)
      try {
        const item = normalizeCandidate(raw);
        if (source.source_type === 'API' && !isRelevantMetadata(item.title, item.description)) {
          skipped++;
          continue;
        }
        const categories = classifyTopics(item.title, item.description);
        await db.$transaction(async (tx) => {
          const duplicate = await tx.content_items.findFirst({
            where: {
              OR: [{ canonical_url: item.canonicalUrl }, { content_fingerprint: item.fingerprint }],
            },
            select: { id: true, metadata: true },
          });
          if (duplicate) {
            await tx.content_items.update({
              where: { id: duplicate.id },
              data: {
                ...(item.description ? { description: item.description } : {}),
                ...(item.author ? { author: item.author } : {}),
                ...(item.publishedAt ? { published_at: item.publishedAt } : {}),
                ...(item.thumbnailUrl ? { thumbnail_url: item.thumbnailUrl } : {}),
                metadata: {
                  ...duplicate.metadata,
                  ...item.metadata,
                  topicMethod: 'metadata-keywords',
                  aiEnabled: false,
                },
              },
            });
            skipped++;
            return;
          }
          const publisher = await tx.publishers.upsert({
            where: { domain: item.domain },
            create: {
              name: item.domain,
              domain: item.domain,
              homepage_url: `https://${item.domain}`,
            },
            update: {},
          });
          await tx.content_items.create({
            data: {
              content_type: item.type,
              title: item.title,
              url: item.url,
              canonical_url: item.canonicalUrl,
              content_fingerprint: item.fingerprint,
              description: item.description,
              author: item.author,
              published_at: item.publishedAt,
              source_id: source.id,
              publisher_id: publisher.id,
              thumbnail_url: item.thumbnailUrl,
              duration_seconds: item.durationSeconds,
              external_id: item.metadata?.externalId || null,
              metadata: { ...item.metadata, topicMethod: 'metadata-keywords', aiEnabled: false },
              ai_status: 'PENDING',
              content_category_map: {
                create: categories.map((category_slug) => ({ category_slug })),
              },
            },
          });
          inserted++;
        });
      } catch (error) {
        if (error.code === 'P2002') skipped++;
        else {
          failed++;
          if (reasons.length < 5)
            reasons.push(
              error.name === 'ZodError'
                ? 'Invalid candidate metadata'
                : 'Candidate normalization/storage failed',
            );
        }
      }
    await db.sources.update({ where: { id: source.id }, data: { last_fetched_at: new Date() } });
    return await db.ingestion_runs.update({
      where: { id: run.id },
      data: {
        status: failed ? 'FAILED' : 'COMPLETED',
        ended_at: new Date(),
        fetched_count: fetched,
        inserted_count: inserted,
        skipped_count: skipped,
        failed_count: failed,
        error_summary: reasons.length ? reasons.join('; ') : null,
      },
    });
  } catch (error) {
    return db.ingestion_runs.update({
      where: { id: run.id },
      data: {
        status: 'FAILED',
        ended_at: new Date(),
        fetched_count: fetched,
        inserted_count: inserted,
        skipped_count: skipped,
        failed_count: Math.max(1, failed),
        error_summary: /^Upstream status \d+$/.test(error.message)
          ? error.message
          : 'Source fetch or processing failed',
      },
    });
  }
}
const instances = new WeakMap();
export function createIngestion(db, logger = console) {
  if (instances.has(db)) return instances.get(db);
  let running = false;
  async function execute(sources, runs) {
    try {
      for (let i = 0; i < sources.length; i++)
        await ingestSource(db, sources[i], { runId: runs[i].id });
    } catch {
      logger.error(JSON.stringify({ event: 'ingestion_failed' }));
      await db.ingestion_runs
        .updateMany({
          where: { id: { in: runs.map((r) => r.id) }, status: { in: ['PENDING', 'RUNNING'] } },
          data: { status: 'FAILED', ended_at: new Date(), error_summary: 'Ingestion interrupted' },
        })
        .catch(() => {});
    } finally {
      running = false;
    }
  }
  async function start(ids, wait = false) {
    if (running) return null;
    running = true;
    try {
      const sources = await db.sources.findMany({
        where: { is_enabled: true, ...(ids?.length ? { id: { in: ids } } : {}) },
        orderBy: { name: 'asc' },
      });
      const runs = await db.$transaction(
        sources.map((source) =>
          db.ingestion_runs.create({ data: { source_id: source.id, status: 'PENDING' } }),
        ),
      );
      const completion = execute(sources, runs);
      if (wait) await completion;
      else void completion;
      return runs.map((r) => r.id);
    } catch (error) {
      running = false;
      throw error;
    }
  }
  const instance = {
    run: (ids) => start(ids, true),
    enqueue: (ids) => start(ids, false),
    isRunning: () => running,
  };
  instances.set(db, instance);
  return instance;
}

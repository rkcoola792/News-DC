import { Router } from 'express';
import { timingSafeEqual, createHash } from 'node:crypto';
import { z } from 'zod';
import {
  filters,
  uuid,
  listContent,
  topicsWithCounts,
  serialize,
  include,
} from './content/service.js';
import { createIngestion, ingestSource } from './ingestion/service.js';
import { createAIProviders, probeTask } from './ai/providers.js';
const hash = (s) => createHash('sha256').update(s).digest();
export function createRoutes(
  db,
  {
    adminKey = process.env.ADMIN_API_KEY,
    logger = console,
    aiProviders = createAIProviders(db),
  } = {},
) {
  const router = Router();
  const ingestion = createIngestion(db, logger);
  const asyncRoute = (fn) => (req, res, next) => Promise.resolve(fn(req, res)).catch(next);
  const parse = (req) => filters.parse(req.query);
  router.get('/content/types', (_req, res) =>
    res.json({ data: ['ARTICLE', 'VIDEO', 'RESEARCH', 'DISCUSSION'] }),
  );
  for (const [route, kind] of [
    ['/content', 'content'],
    ['/search', 'content'],
    ['/recommendations/for-you', 'for-you'],
    ['/recommendations/trending', 'trending'],
  ])
    router.get(
      route,
      asyncRoute(async (req, res) => res.json(await listContent(db, parse(req), kind))),
    );
  router.get(
    '/topics',
    asyncRoute(async (_req, res) => res.json({ data: await topicsWithCounts(db) })),
  );
  router.get(
    '/topics/:slug/content',
    asyncRoute(async (req, res) =>
      res.json(await listContent(db, filters.parse({ ...req.query, category: req.params.slug }))),
    ),
  );
  router.get(
    '/publishers',
    asyncRoute(async (_req, res) =>
      res.json({
        data: await db.publishers.findMany({
          select: { id: true, name: true, domain: true },
          orderBy: { name: 'asc' },
        }),
      }),
    ),
  );
  router.get(
    '/content/:id/related',
    asyncRoute(async (req, res) => {
      const id = uuid.parse(req.params.id);
      const item = await db.content_items.findUnique({ where: { id }, include });
      if (!item)
        return res
          .status(404)
          .json({ error: { code: 'NOT_FOUND', message: 'Content not found.', details: [] } });
      const slugs = item.content_category_map.map((m) => m.category_slug);
      const data = slugs.length
        ? await db.content_items.findMany({
            where: {
              id: { not: id },
              content_category_map: { some: { category_slug: { in: slugs } } },
            },
            include,
            orderBy: [{ published_at: { sort: 'desc', nulls: 'last' } }, { id: 'asc' }],
            take: 5,
          })
        : [];
      res.json({ data: data.map(serialize) });
    }),
  );
  router.get(
    '/content/:id/summary',
    asyncRoute(async (req, res) => {
      const item = await db.content_items.findUnique({
        where: { id: uuid.parse(req.params.id) },
        include,
      });
      if (!item)
        return res
          .status(404)
          .json({ error: { code: 'NOT_FOUND', message: 'Content not found.', details: [] } });
      res.json({ data: serialize(item).ai, enabled: false });
    }),
  );
  router.get(
    '/content/:id',
    asyncRoute(async (req, res) => {
      const row = await db.content_items.findUnique({
        where: { id: uuid.parse(req.params.id) },
        include,
      });
      if (!row)
        return res
          .status(404)
          .json({ error: { code: 'NOT_FOUND', message: 'Content not found.', details: [] } });
      res.json({ data: serialize(row) });
    }),
  );
  router.post('/assistant/ask', (_req, res) =>
    res.status(503).json({
      error: {
        code: 'AI_DISABLED',
        message: 'AI features are intentionally disabled for this build.',
        details: [],
      },
    }),
  );
  router.get(
    '/exports/:format',
    asyncRoute(async (req, res) => {
      if (!['content.json', 'content.md'].includes(req.params.format)) return res.sendStatus(404);
      const result = await listContent(db, filters.parse({ ...req.query, page: 1, limit: 100 }));
      res.set('Content-Disposition', `attachment; filename="${req.params.format}"`);
      if (req.params.format === 'content.json') return res.json({ ...result, exportLimit: 100 });
      const escape = (s) => String(s ?? '').replace(/[\[\]\*\_\`#<>]/g, '');
      res
        .type('text/markdown')
        .send(
          '# NewsDC reading list\n\n' +
            result.data
              .map(
                (r) =>
                  `## ${escape(r.title)}\n\n${r.contentType} · ${escape(r.publisher?.name || 'Unknown publisher')}\n\n${escape(r.description)}\n\nOriginal: <${r.url.replace(/[<>\s]/g, '')}>\n`,
              )
              .join('\n'),
        );
    }),
  );
  // Operator credentials are checked server-side and never embedded in the client bundle.
  const attempts = new Map();
  router.use('/admin', (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    if (!adminKey)
      return res.status(503).json({
        error: {
          code: 'ADMIN_DISABLED',
          message: 'Configure ADMIN_API_KEY on the server.',
          details: [],
        },
      });
    const key = req.ip || 'local';
    const now = Date.now();
    const entry = attempts.get(key);
    const token = (req.get('authorization') || '').replace(/^Bearer /, '');
    const authorized = timingSafeEqual(hash(token), hash(adminKey));
    if (authorized) {
      attempts.delete(key);
      return next();
    }
    for (const [ip, attempt] of attempts) if (attempt.until <= now) attempts.delete(ip);
    if (entry && entry.until > now && entry.count >= 30)
      return res.status(429).json({
        error: {
          code: 'RATE_LIMITED',
          message: 'Too many attempts. Try again in one minute.',
          details: [],
        },
      });
    if (!authorized) {
      if (attempts.size >= 10000 && !attempts.has(key))
        attempts.delete(attempts.keys().next().value);
      attempts.set(key, {
        count: entry && entry.until > now ? entry.count + 1 : 1,
        until: now + 60000,
      });
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'An operator key is required.', details: [] },
      });
    }
    next();
  });
  router.get(
    '/admin/metrics',
    asyncRoute(async (_req, res) => {
      const [total, byType, processing, runs, activity] = await Promise.all([
        db.content_items.count(),
        db.content_items.groupBy({ by: ['content_type'], _count: { _all: true } }),
        db.content_items.groupBy({ by: ['ai_status'], _count: { _all: true } }),
        db.ingestion_runs.findMany({
          take: 20,
          orderBy: { started_at: 'desc' },
          include: { sources: { select: { name: true } } },
        }),
        db.content_items.findMany({
          where: { created_at: { gte: new Date(Date.now() - 7 * 86400000) } },
          select: { created_at: true },
        }),
      ]);
      const daily = {};
      for (const row of activity) {
        const day = row.created_at.toISOString().slice(0, 10);
        daily[day] = (daily[day] || 0) + 1;
      }
      res.json({
        total,
        byType: byType.map((r) => ({ type: r.content_type, count: r._count._all })),
        processing: processing.map((r) => ({ status: r.ai_status, count: r._count._all })),
        runs,
        daily,
        aiEnabled: false,
        ingestionRunning: ingestion.isRunning(),
      });
    }),
  );
  router.get(
    '/admin/sources',
    asyncRoute(async (_req, res) =>
      res.json({
        data: await db.sources.findMany({
          orderBy: { name: 'asc' },
          include: { ingestion_runs: { take: 1, orderBy: { started_at: 'desc' } } },
        }),
      }),
    ),
  );
  router.get(
    '/admin/ai/providers',
    asyncRoute(async (_req, res) => res.json({ data: await aiProviders.status() })),
  );
  router.post(
    '/admin/ai/providers/check',
    asyncRoute(async (req, res) => {
      z.object({})
        .strict()
        .parse(req.body || {});
      res.json({
        data: await aiProviders.generate(probeTask),
        message: 'AI provider connection verified.',
      });
    }),
  );
  router.patch(
    '/admin/sources/:id',
    asyncRoute(async (req, res) => {
      const body = z.object({ enabled: z.boolean() }).strict().parse(req.body);
      const data = await db.sources.update({
        where: { id: uuid.parse(req.params.id) },
        data: { is_enabled: body.enabled },
      });
      res.json({ data });
    }),
  );
  router.get(
    '/admin/ingestion/runs',
    asyncRoute(async (req, res) =>
      res.json({
        data: await db.ingestion_runs.findMany({
          take: 50,
          orderBy: { started_at: 'desc' },
          include: { sources: { select: { name: true } } },
        }),
      }),
    ),
  );
  router.get(
    '/admin/ingestion/runs/:id',
    asyncRoute(async (req, res) => {
      const data = await db.ingestion_runs.findUnique({
        where: { id: uuid.parse(req.params.id) },
        include: { sources: true },
      });
      res
        .status(data ? 200 : 404)
        .json(
          data
            ? { data }
            : { error: { code: 'NOT_FOUND', message: 'Run not found.', details: [] } },
        );
    }),
  );
  router.post(
    '/admin/ingestion/run',
    asyncRoute(async (req, res) => {
      const { sourceIds } = z
        .object({ sourceIds: z.array(uuid).max(10).optional() })
        .strict()
        .parse(req.body || {});
      if (ingestion.isRunning())
        return res.status(409).json({
          error: {
            code: 'ALREADY_RUNNING',
            message: 'An ingestion run is already active.',
            details: [],
          },
        });
      const runIds = await ingestion.enqueue(sourceIds);
      if (!runIds)
        return res.status(409).json({
          error: {
            code: 'ALREADY_RUNNING',
            message: 'An ingestion run is already active.',
            details: [],
          },
        });
      res.status(202).json({
        status: 'accepted',
        runIds,
        message: 'Ingestion started. Inspect run history for results.',
      });
    }),
  );
  router.post(
    '/admin/content/import',
    asyncRoute(async (req, res) => {
      const body = z
        .object({
          sourceId: uuid,
          items: z.array(z.record(z.string(), z.unknown())).min(1).max(100),
        })
        .strict()
        .parse(req.body);
      const source = await db.sources.findUnique({ where: { id: body.sourceId } });
      if (!source)
        return res
          .status(404)
          .json({ error: { code: 'NOT_FOUND', message: 'Source not found.', details: [] } });
      res.json({ data: await ingestSource(db, source, { candidates: body.items }) });
    }),
  );
  return { router, ingestion };
}

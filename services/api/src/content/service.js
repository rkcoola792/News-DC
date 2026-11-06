import { z } from 'zod';
import { topicOptions } from '@newsdc/shared/taxonomy';
const csv = (value) => (value ? String(value).split(',').filter(Boolean) : []);
export const uuid = z.uuid();
export const filters = z
  .object({
    q: z.string().max(200).default(''),
    type: z.enum(['ARTICLE', 'VIDEO', 'RESEARCH', 'DISCUSSION']).optional(),
    category: z.enum(topicOptions.map((t) => t.id)).optional(),
    publisher: z.string().max(200).optional(),
    from: z.iso.date().optional(),
    to: z.iso.date().optional(),
    minQuality: z.coerce.number().min(0).max(100).optional(),
    minRelevance: z.coerce.number().min(0).max(100).optional(),
    page: z.coerce.number().int().min(1).max(100000).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sort: z.enum(['publishedAt', 'relevance', 'quality', 'title']).default('publishedAt'),
    order: z.enum(['asc', 'desc']).default('desc'),
    ids: z.string().max(16000).optional(),
    topics: z.string().max(1000).optional(),
    types: z.string().max(100).optional(),
    read: z.string().max(8000).optional(),
    timeframe: z.enum(['all', '24h', '7d', '30d']).default('all'),
  })
  .strict()
  .superRefine((v, ctx) => {
    if (v.from && v.to && v.from > v.to)
      ctx.addIssue({ code: 'custom', message: 'from must be before to', path: ['from'] });
    for (const key of ['ids', 'read'])
      if (csv(v[key]).some((id) => !uuid.safeParse(id).success))
        ctx.addIssue({ code: 'custom', message: 'Invalid content ID', path: [key] });
    if (csv(v.topics).some((id) => !topicOptions.some((t) => t.id === id)))
      ctx.addIssue({ code: 'custom', message: 'Unknown topic', path: ['topics'] });
    if (csv(v.types).some((id) => !['ARTICLE', 'VIDEO', 'RESEARCH', 'DISCUSSION'].includes(id)))
      ctx.addIssue({ code: 'custom', message: 'Unknown type', path: ['types'] });
  });
export const include = {
  publishers: true,
  content_category_map: { include: { categories: true } },
};
export function serialize(row) {
  return {
    id: row.id,
    contentType: row.content_type,
    title: row.title,
    description: row.description,
    url: row.url,
    author: row.author,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    thumbnailUrl: row.thumbnail_url,
    durationSeconds: row.duration_seconds,
    publisher: row.publishers
      ? { id: row.publishers.id, name: row.publishers.name, domain: row.publishers.domain }
      : null,
    categories: row.content_category_map.map((m) => ({
      slug: m.categories.slug,
      name: m.categories.name,
    })),
    metadata: row.metadata,
    ai: {
      status: row.ai_status,
      summary: row.ai_summary,
      keyInsights: row.key_insights || [],
      qualityScore: row.quality_score == null ? null : Number(row.quality_score),
      relevanceScore: row.relevance_score == null ? null : Number(row.relevance_score),
    },
  };
}
export function whereFor(f) {
  const where = {
    AND: [{ OR: [{ is_data_center_relevant: true }, { is_data_center_relevant: null }] }],
  };
  if (f.type) where.content_type = f.type;
  if (f.category) where.content_category_map = { some: { category_slug: f.category } };
  if (f.publisher)
    where.publishers = {
      is: {
        OR: [{ domain: f.publisher }, { name: { contains: f.publisher, mode: 'insensitive' } }],
      },
    };
  if (f.from || f.to)
    where.published_at = {
      ...(f.from ? { gte: new Date(f.from) } : {}),
      ...(f.to ? { lt: new Date(new Date(f.to).getTime() + 86400000) } : {}),
    };
  if (f.minQuality !== undefined) where.quality_score = { gte: f.minQuality };
  if (f.minRelevance !== undefined) where.relevance_score = { gte: f.minRelevance };
  if (f.ids) where.id = { in: csv(f.ids) };
  const words = f.q.match(/[\p{L}\p{N}]+/gu)?.slice(0, 20) || [];
  if (words.length) {
    const search = words.join(' & ');
    where.AND.push({
      OR: [{ title: { search } }, { description: { search } }, { content_text: { search } }],
    });
  }
  if (f.timeframe !== 'all')
    where.AND.push({
      published_at: {
        gte: new Date(Date.now() - { '24h': 1, '7d': 7, '30d': 30 }[f.timeframe] * 86400000),
      },
    });
  return where;
}
function rank(row, f, kind) {
  const age = (Date.now() - new Date(row.published_at || row.created_at).getTime()) / 86400000;
  const freshness = 100 * Math.exp(-Math.max(0, age) / 7);
  const points = Number(row.metadata?.points);
  const engagement = Number.isFinite(points)
    ? Math.min(100, Math.log1p(Math.max(0, points)) * 15)
    : 0;
  if (kind === 'trending') return freshness * 0.8 + engagement * 0.2;
  const topic = csv(f.topics).some((t) =>
    row.content_category_map.some((m) => m.category_slug === t),
  );
  return (
    Number(topic) * 200 +
    Number(csv(f.types).includes(row.content_type)) * 100 +
    freshness * 0.1 +
    engagement * 0.02 -
    Number(csv(f.read).includes(row.id)) * 20
  );
}
export async function listContent(db, f, kind = 'content') {
  const where = whereFor(f);
  let data, total;
  if (kind === 'for-you' || kind === 'trending') {
    const rows = await db.content_items.findMany({ where, include });
    total = rows.length;
    rows.sort(
      (a, b) =>
        rank(b, f, kind) - rank(a, f, kind) ||
        b.created_at - a.created_at ||
        a.id.localeCompare(b.id),
    );
    data = rows.slice((f.page - 1) * f.limit, f.page * f.limit);
  } else {
    const field = {
      publishedAt: 'published_at',
      quality: 'quality_score',
      relevance: 'relevance_score',
      title: 'title',
    }[f.sort];
    const order =
      f.sort === 'relevance' && f.q.match(/[\p{L}\p{N}]+/gu)?.length
        ? {
            _relevance: {
              fields: ['title', 'description'],
              search: f.q
                .match(/[\p{L}\p{N}]+/gu)
                .slice(0, 20)
                .join(' & '),
              sort: f.order,
            },
          }
        : field === 'title'
          ? { [field]: f.order }
          : { [field]: { sort: f.order, nulls: 'last' } };
    [data, total] = await db.$transaction([
      db.content_items.findMany({
        where,
        include,
        orderBy: [order, { id: 'asc' }],
        skip: (f.page - 1) * f.limit,
        take: f.limit,
      }),
      db.content_items.count({ where }),
    ]);
  }
  return {
    data: data.map(serialize),
    pagination: { page: f.page, limit: f.limit, total, totalPages: Math.ceil(total / f.limit) },
    ...(kind !== 'content'
      ? {
          ranking: {
            method: kind === 'for-you' ? 'local-preferences-freshness' : 'freshness-engagement',
            ai: false,
          },
        }
      : {}),
  };
}
export async function topicsWithCounts(db) {
  const rows = await db.categories.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { content_category_map: true } } },
  });
  return rows.map((r) => ({ slug: r.slug, name: r.name, count: r._count.content_category_map }));
}

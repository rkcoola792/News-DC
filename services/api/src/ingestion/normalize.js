import { createHash } from 'node:crypto';
import { z } from 'zod';
export function cleanText(value, limit = 4000) {
  return String(value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, limit);
}
export const tagList = z
  .array(
    z
      .string()
      .max(500)
      .transform((value) => cleanText(value, 500).normalize('NFC').toLowerCase())
      .pipe(z.string().min(1).max(80)),
  )
  .max(100)
  .transform((values) => [...new Set(values)])
  .refine((values) => values.length <= 30, 'At most 30 unique tags are allowed');
const input = z.object({
  title: z.string().trim().min(1).max(1000),
  url: z
    .url()
    .refine(
      (s) =>
        ['http:', 'https:'].includes(new URL(s).protocol) &&
        !new URL(s).username &&
        !new URL(s).password,
      'HTTP(S) URL required',
    ),
  type: z.enum(['ARTICLE', 'VIDEO', 'RESEARCH', 'DISCUSSION']),
  description: z.string().nullable().optional(),
  author: z.string().nullable().optional(),
  publishedAt: z.string().nullable().optional(),
  thumbnailUrl: z.url().nullable().optional(),
  durationSeconds: z.number().int().nonnegative().nullable().optional(),
  tags: tagList.optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export function canonicalize(value) {
  const url = new URL(value);
  url.hash = '';
  for (const key of [...url.searchParams.keys()])
    if (/^(utm_|fbclid$|gclid$|mc_cid$|mc_eid$)/i.test(key)) url.searchParams.delete(key);
  url.searchParams.sort();
  return url.toString();
}
export function normalizeCandidate(raw) {
  const data = input.parse({
    ...raw,
    title: cleanText(raw.title, 1000),
    description: raw.description ? cleanText(raw.description) : null,
  });
  const published = data.publishedAt ? new Date(data.publishedAt) : null;
  if (published && !Number.isFinite(published.getTime()))
    throw new Error('Invalid publication date');
  const domain = new URL(data.url).hostname.toLowerCase();
  return {
    ...data,
    publishedAt: published,
    canonicalUrl: canonicalize(data.url),
    domain,
    fingerprint: createHash('sha256')
      .update(`${domain}|${data.title.toLowerCase().replace(/\W+/g, ' ').trim()}`)
      .digest('hex'),
  };
}
const rules = {
  infrastructure: /data.?cent(er|re)|server|rack/i,
  'ai-compute-gpus': /gpu|nvidia|compute|accelerator/i,
  'power-energy': /power|energy|electric|grid/i,
  cooling: /cooling|coolant|liquid|thermal/i,
  sustainability: /sustainab|carbon|pue|wue|renewable/i,
  'hyperscaler-investments': /hyperscal|microsoft|google|amazon|aws|meta|investment/i,
  economics: /cost|financ|econom|billion/i,
  'site-selection': /location|site selection|land/i,
  networking: /network|interconnect|ethernet|infiniband/i,
  optimization: /optim|utilization|efficiency/i,
  'ai-agentic-ai': /agentic|artificial intelligence|\bAI\b/i,
  security: /security|attack|cyber/i,
  regulation: /regulat|policy|law|permit/i,
  'emerging-technologies': /emerging|quantum|photon/i,
};
export function classifyTopics(title, description = '') {
  const text = title + ' ' + description;
  return Object.entries(rules)
    .filter(([, rule]) => rule.test(text))
    .map(([slug]) => slug);
}
export function isRelevantMetadata(title, description = '') {
  return /data.?cent(er|re)|hyperscal|liquid cooling|gpu cluster|AI infrastructure/i.test(
    title + ' ' + description,
  );
}

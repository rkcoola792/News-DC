import { XMLParser } from 'fast-xml-parser';
import { cleanText } from './normalize.js';
export const sourceDefinitions = [
  {
    id: '10000000-0000-4000-8000-000000000001',
    name: 'Hacker News · data centers',
    source_type: 'API',
    endpoint_url:
      'https://hn.algolia.com/api/v1/search_by_date?query=data%20center&tags=story&hitsPerPage=50',
  },
  {
    id: '10000000-0000-4000-8000-000000000002',
    name: 'Data Center Knowledge RSS',
    source_type: 'RSS',
    endpoint_url: 'https://www.datacenterknowledge.com/rss.xml',
  },
];
export async function seedSources(db) {
  for (const source of sourceDefinitions)
    await db.sources.upsert({
      where: { id: source.id },
      create: source,
      update: {
        name: source.name,
        source_type: source.source_type,
        endpoint_url: source.endpoint_url,
      },
    });
}
async function fetchText(url, fetcher) {
  // Only the two reviewed registry endpoints are fetched; no arbitrary user-controlled URL requests.
  if (!sourceDefinitions.some((s) => s.endpoint_url === url))
    throw new Error('Source endpoint is not approved');
  let last;
  for (let attempt = 0; attempt < 2; attempt++)
    try {
      const response = await fetcher(url, {
        signal: AbortSignal.timeout(10000),
        redirect: 'error',
        headers: {
          'User-Agent': 'NewsDC/0.1 public-metadata-reader',
          Accept: 'application/json, application/rss+xml, application/xml, text/xml',
        },
      });
      if (!response.ok) {
        const error = new Error(`Upstream status ${response.status}`);
        error.noRetry =
          response.status === 429 || response.status === 403 || response.status === 404;
        throw error;
      }
      let size = 0;
      const parts = [];
      for await (const chunk of response.body) {
        size += chunk.length;
        if (size > 2_000_000) throw new Error('Source exceeds response limit');
        parts.push(chunk);
      }
      return Buffer.concat(parts).toString('utf8');
    } catch (error) {
      last = error;
      if (error.noRetry) break;
      if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 500));
    }
  throw last;
}
function extractTags(value) {
  if (value === undefined || value === null) return undefined;
  return (Array.isArray(value) ? value : [value]).map((tag) =>
    typeof tag === 'object' ? (tag['#text'] ?? tag['@_term']) : String(tag),
  );
}
export async function fetchCandidates(source, fetcher = fetch) {
  const text = await fetchText(source.endpoint_url, fetcher);
  if (source.source_type === 'API') {
    const payload = JSON.parse(text);
    if (!Array.isArray(payload.hits)) throw new Error('Unexpected API response');
    return payload.hits.slice(0, 100).map((h) => ({
      title: h.title,
      url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
      type: 'DISCUSSION',
      description: cleanText(h.story_text || ''),
      tags: Array.isArray(h.tags) ? h.tags : undefined,
      author: h.author || null,
      publishedAt: h.created_at || null,
      metadata: {
        points: h.points ?? null,
        comments: h.num_comments ?? null,
        discussionUrl: `https://news.ycombinator.com/item?id=${h.objectID}`,
        externalId: h.objectID,
      },
    }));
  }
  const parsed = new XMLParser({
    ignoreAttributes: false,
    processEntities: false,
    parseTagValue: false,
  }).parse(text);
  const entries = parsed.rss?.channel?.item ?? parsed.feed?.entry;
  if (!entries) throw new Error('Feed contains no supported entries');
  return (Array.isArray(entries) ? entries : [entries]).slice(0, 100).map((e) => ({
    title: cleanText(e.title),
    url: typeof e.link === 'string' ? e.link : e.link?.['@_href'],
    type: 'ARTICLE',
    tags: extractTags(e.category),
    description: cleanText(e.description || e.summary || ''),
    author: cleanText(e['dc:creator'] || e.author?.name || '') || null,
    publishedAt: e.pubDate || e.published || e.updated || null,
    thumbnailUrl:
      e['media:thumbnail']?.['@_url'] ||
      (e['media:content']?.['@_type']?.startsWith('image/') ? e['media:content']['@_url'] : null),
    metadata: { sourceFormat: 'RSS' },
  }));
}

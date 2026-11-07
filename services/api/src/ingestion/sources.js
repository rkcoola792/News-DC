import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { cleanText } from './normalize.js';
import { videoCandidate, youtubeId } from './video.js';
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
  {
    id: '10000000-0000-4000-8000-000000000003',
    name: 'arXiv · data center research',
    source_type: 'API',
    endpoint_url:
      'https://export.arxiv.org/api/query?search_query=ti:%22data%20center%22%20OR%20ti:%22datacenter%22%20OR%20ti:%22data%20centre%22&start=0&max_results=50&sortBy=submittedDate&sortOrder=descending',
    config: { adapter: 'arxiv', metadataOnly: true, maxResults: 50 },
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
        ...(source.config ? { config: source.config } : {}),
      },
    });
}
async function fetchText(url, fetcher) {
  // Only reviewed registry endpoints are fetched; no arbitrary user-controlled URL requests.
  if (!sourceDefinitions.some((s) => s.endpoint_url === url) && !isResearchURL(url))
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
      if (attempt === 0)
        await new Promise((resolve) => setTimeout(resolve, isArxiv(url) ? 3000 : 500));
    }
  throw last;
}
export function researchPageURL(start = 0) {
  if (!Number.isInteger(start) || start < 0 || start > 550 || start % 50 !== 0)
    throw Error('Unsupported research page');
  const url = new URL(sourceDefinitions[2].endpoint_url);
  url.searchParams.set('start', String(start));
  return url.toString();
}
function isResearchURL(value) {
  try {
    const url = new URL(value),
      expected = new URL(sourceDefinitions[2].endpoint_url);
    return (
      url.origin === expected.origin &&
      url.pathname === expected.pathname &&
      !url.username &&
      !url.password &&
      [...url.searchParams].length === 5 &&
      [...url.searchParams.keys()].every((key) => expected.searchParams.has(key)) &&
      ['search_query', 'max_results', 'sortBy', 'sortOrder'].every(
        (key) => url.searchParams.get(key) === expected.searchParams.get(key),
      ) &&
      /^\d+$/.test(url.searchParams.get('start') || '') &&
      Number(url.searchParams.get('start')) <= 550 &&
      Number(url.searchParams.get('start')) % 50 === 0
    );
  } catch {
    return false;
  }
}
const isArxiv = isResearchURL;
let researchRequest = Promise.resolve();
let nextResearchRequestAt = 0;
// arXiv requires one connection and at least three seconds between requests.
// This process-local queue also covers manual runs and retries. Run one ingestion process.
function fetchResearchText(url, fetcher) {
  const pending = researchRequest.then(async () => {
    const delay = nextResearchRequestAt - Date.now();
    if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay));
    try {
      return await fetchText(url, fetcher);
    } finally {
      nextResearchRequestAt = Date.now() + 3000;
    }
  });
  researchRequest = pending.catch(() => {});
  return pending;
}
const asArray = (value) => (value == null ? [] : Array.isArray(value) ? value : [value]);
const atomText = (value) => cleanText(typeof value === 'object' ? value?.['#text'] : value);

export function parseResearchFeed(text) {
  if (XMLValidator.validate(text) !== true) throw new Error('Invalid arXiv XML response');
  const parsed = new XMLParser({
    ignoreAttributes: false,
    processEntities: false,
    parseTagValue: false,
  }).parse(text);
  if (!parsed.feed) throw new Error('Unexpected arXiv response');
  const entries = asArray(parsed.feed.entry);
  if (entries.some((entry) => String(entry.id).includes('/api/errors')))
    throw new Error('arXiv returned a query error');
  if (!entries.length && String(parsed.feed['opensearch:totalResults']) !== '0')
    throw new Error('arXiv response is missing entries');
  return entries.slice(0, 50).map((entry) => {
    const id = atomText(entry.id).match(/^https?:\/\/arxiv\.org\/abs\/(.+)$/)?.[1];
    if (!id || !/^(?:\d{4}\.\d{4,5}|[a-z-]+(?:\.[A-Z]{2})?\/\d{7})(?:v\d+)?$/.test(id))
      throw new Error('Invalid arXiv paper identifier');
    const authors = asArray(entry.author)
      .map((author) => atomText(author.name))
      .filter(Boolean);
    return {
      title: atomText(entry.title),
      url: `https://arxiv.org/abs/${id}`,
      type: 'RESEARCH',
      description: atomText(entry.summary),
      author: authors.join(', ') || null,
      publishedAt: entry.published || null,
      tags: extractTags(entry.category),
      metadata: {
        sourceFormat: 'arXiv Atom',
        externalId: id,
        arxivId: id,
        authors,
        doi: atomText(entry['arxiv:doi']) || null,
        journalReference: atomText(entry['arxiv:journal_ref']) || null,
        updatedAt: entry.updated || null,
        primaryCategory: entry['arxiv:primary_category']?.['@_term'] || null,
        descriptionOrigin: 'source-abstract',
      },
    };
  });
}
function extractTags(value) {
  if (value === undefined || value === null) return undefined;
  return (Array.isArray(value) ? value : [value]).map((tag) =>
    typeof tag === 'object' ? (tag['#text'] ?? tag['@_term']) : String(tag),
  );
}
export async function fetchCandidates(source, fetcher = fetch) {
  if (isArxiv(source.endpoint_url))
    return parseResearchFeed(await fetchResearchText(source.endpoint_url, fetcher));
  const text = await fetchText(source.endpoint_url, fetcher);
  if (source.source_type === 'API') {
    const payload = JSON.parse(text);
    if (!Array.isArray(payload.hits)) throw new Error('Unexpected API response');
    const candidates = payload.hits.slice(0, 100).map((h) => ({
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
    let videos = 0;
    for (let i = 0; i < candidates.length; i++)
      if (youtubeId(candidates[i].url) && videos++ < 5)
        candidates[i] = await videoCandidate(candidates[i], fetcher);
    return candidates;
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

import { cleanText } from './normalize.js';
export function youtubeId(value) {
  try {
    const url = new URL(value);
    if (
      !['https:', 'http:'].includes(url.protocol) ||
      url.username ||
      url.password ||
      !['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'].includes(url.hostname)
    )
      return null;
    const id =
      url.hostname === 'youtu.be'
        ? url.pathname.slice(1)
        : url.pathname === '/watch'
          ? url.searchParams.get('v')
          : /^\/(shorts|live|embed)\//.test(url.pathname)
            ? url.pathname.split('/')[2]
            : null;
    return /^[\w-]{11}$/.test(id || '') ? id : null;
  } catch {
    return null;
  }
}
export async function videoCandidate(candidate, fetcher = fetch) {
  const id = youtubeId(candidate.url);
  if (!id) return candidate;
  const url = `https://www.youtube.com/watch?v=${id}`;
  const base = {
    ...candidate,
    url,
    type: 'VIDEO',
    author: null,
    publishedAt: null,
    thumbnailUrl: null,
    metadata: {
      ...candidate.metadata,
      descriptionOrigin: 'discovery-post-text',
      videoId: id,
      discoveryTitle: candidate.title,
      originalDiscoveryUrl: candidate.url,
      discoveredAt: candidate.publishedAt,
      sourceFormat: 'YouTube oEmbed via Hacker News',
      videoMetadataStatus: 'UNAVAILABLE',
    },
  };
  try {
    const endpoint = new URL('https://www.youtube.com/oembed');
    endpoint.searchParams.set('url', url);
    endpoint.searchParams.set('format', 'json');
    const response = await fetcher(endpoint.toString(), {
      signal: AbortSignal.timeout(8000),
      redirect: 'error',
      headers: { Accept: 'application/json', 'User-Agent': 'NewsDC/0.1 public-metadata-reader' },
    });
    if (!response.ok) {
      base.metadata.videoMetadataStatus = `UPSTREAM_${response.status}`;
      return base;
    }
    const chunks = [];
    let size = 0;
    for await (const chunk of response.body) {
      size += chunk.length;
      if (size > 64000) throw Error('Oversized video metadata');
      chunks.push(chunk);
    }
    const data = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (typeof data.title !== 'string' || typeof data.author_name !== 'string')
      throw Error('Invalid video metadata');
    let thumbnail = null;
    try {
      const image = new URL(data.thumbnail_url);
      if (
        image.protocol === 'https:' &&
        (image.hostname.endsWith('.ytimg.com') || image.hostname === 'img.youtube.com') &&
        !image.username &&
        !image.password
      )
        thumbnail = image.toString();
    } catch {}
    return {
      ...base,
      title: cleanText(data.title, 1000),
      author: cleanText(data.author_name, 300),
      thumbnailUrl: thumbnail,
      metadata: {
        ...base.metadata,
        videoMetadataStatus: 'COMPLETED',
        channel: cleanText(data.author_name, 300),
        channelUrl: typeof data.author_url === 'string' ? data.author_url : null,
      },
    };
  } catch {
    return base;
  }
}

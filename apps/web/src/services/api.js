const base = import.meta.env?.VITE_API_BASE_URL || '/api/v1';
export async function request(path, { signal, adminKey, method = 'GET', body } = {}) {
  const response = await fetch(base + path, {
    signal,
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(adminKey ? { Authorization: `Bearer ${adminKey}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const details = result.error?.details
      ?.map((d) => `${d.path || 'Input'}: ${d.message}`)
      .join('; ');
    throw new Error(details || result.error?.message || `Request failed (${response.status})`);
  }
  return result;
}
export function sourceUrl(value) {
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}
export function asItem(row) {
  const names = {
    ARTICLE: 'Article',
    VIDEO: 'Video',
    RESEARCH: 'Research',
    DISCUSSION: 'Discussion',
  };
  return {
    ...row,
    type: names[row.contentType] || row.contentType,
    topic: row.categories?.map((t) => t.name).join(' · ') || 'Uncategorized',
    summary:
      (row.ai?.current && row.ai.summary) ||
      row.description ||
      'No publisher description available.',
    summaryIsAI: !!(row.ai?.current && row.ai.summary),
  };
}
export function apiBase() {
  return base;
}

export function isContentId(value) {
  return (
    typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
  );
}

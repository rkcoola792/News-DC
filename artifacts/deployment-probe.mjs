import { writeFile } from 'node:fs/promises';
const results = [];
async function probe(base, path, options = {}) {
  const start = Date.now();
  try {
    const response = await fetch(base + path, { ...options, signal: AbortSignal.timeout(45000) });
    const body = await response.text();
    let data;
    try { data = JSON.parse(body); } catch {}
    const result = { base, path, method: options.method || 'GET', status: response.status,
      ms: Date.now() - start, headers: Object.fromEntries(response.headers),
      ...(data ? { data } : { sample: body.slice(0, 300), bytes: body.length }) };
    results.push(result);
    console.log(JSON.stringify({ base, path, status: result.status, ms: result.ms,
      total: data?.pagination?.total, count: data?.data?.length, error: data?.error,
      enabled: data?.enabled, spa: body.includes('id="root"') }));
    return result;
  } catch (error) {
    const result = { base, path, error: error.message, cause: error.cause?.code };
    results.push(result); console.log(JSON.stringify(result)); return result;
  }
}
for (const base of ['https://news-dc.onrender.com', 'http://127.0.0.1:5000']) {
  for (const path of ['/', '/search?q=cooling', '/topics', '/saved', '/ask', '/dashboard', '/preferences', '/history', '/trending',
    '/api/v1/health/live', '/api/v1/health/ready', '/api/v1/content?limit=2',
    '/api/v1/content?type=VIDEO&limit=100', '/api/v1/search?q=cooling&limit=5',
    '/api/v1/topics', '/api/v1/publishers', '/api/v1/recommendations/for-you?limit=3',
    '/api/v1/recommendations/trending?limit=3', '/api/v1/assistant/status', '/api/v1/trends',
    '/api/v1/exports/content.json?type=RESEARCH&q=cooling', '/api/v1/exports/content.md?type=VIDEO',
    '/api/v1/admin/metrics', '/api/v1/content/not-a-uuid', '/api/v1/content?limit=-1', '/api/v1/does-not-exist']) {
    await probe(base, path);
  }
  const list = results.find(r => r.base === base && r.path === '/api/v1/content?limit=2');
  const id = list?.data?.data?.[0]?.id;
  if (id) for (const path of [`/content/${id}`, `/api/v1/content/${id}`, `/api/v1/content/${id}/related`, `/api/v1/content/${id}/summary`]) await probe(base, path);
  await probe(base, '/api/v1/assistant/ask', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({question:'x'})});
}
await writeFile('artifacts/deployment-probe-2026-11-07.json', JSON.stringify(results, null, 2));

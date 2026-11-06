import assert from 'node:assert/strict';
const base = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:5000';
for (const route of ['/', '/search?q=cooling']) {
  const response = await fetch(base + route);
  assert.equal(response.status, 200);
  assert.ok((await response.text()).includes('id="root"'));
}
for (const route of [
  '/api/v1/health/ready',
  '/api/v1/content?limit=1',
  '/api/v1/search?q=cooling',
  '/api/v1/topics',
]) {
  const response = await fetch(base + route);
  assert.equal(response.status, 200);
  const data = await response.json();
  console.log(
    JSON.stringify({
      route,
      status: response.status,
      total: data.pagination?.total ?? data.data?.length ?? null,
    }),
  );
}
if (process.env.ADMIN_API_KEY) {
  const denied = await fetch(base + '/api/v1/admin/metrics');
  assert.equal(denied.status, 401);
  const response = await fetch(base + '/api/v1/admin/metrics', {
    headers: { Authorization: `Bearer ${process.env.ADMIN_API_KEY}` },
  });
  assert.equal(response.status, 200);
  const data = await response.json();
  console.log(
    JSON.stringify({ route: 'admin/metrics', total: data.total, aiEnabled: data.aiEnabled }),
  );
}
console.log('Container smoke checks passed.');

import { writeFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const base = 'https://news-dc.onrender.com';
const records = [];
async function request(path, options = {}) {
  const started = Date.now();
  try {
    const response = await fetch(base + path, {...options, signal:AbortSignal.timeout(120000)});
    const body = await response.text();
    let data; try {data = JSON.parse(body);} catch {}
    const record = {path, method:options.method || 'GET', status:response.status, ms:Date.now()-started, headers:Object.fromEntries(response.headers), data, ...(!data ? {body} : {})};
    records.push(record);
    console.log(JSON.stringify({path,status:record.status,ms:record.ms,error:data?.error, insufficient:data?.insufficientEvidence,cached:data?.cached,sources:data?.sources?.length}));
    return record;
  } catch(error) {const record = {path,error:error.message};records.push(record);console.log(JSON.stringify(record));return record;}
}
const html = await request('/');
const localHtml = await (await fetch('http://127.0.0.1:5000/')).text();
const assets = [...html.body.matchAll(/(?:src|href)="(\/assets\/[^\"]+)"/g)].map(m=>m[1]);
records.push({comparison:'HTML asset names', deployed:assets, local:[...localHtml.matchAll(/(?:src|href)="(\/assets\/[^\"]+)"/g)].map(m=>m[1])});
for (const asset of assets) {
  const result = await request(asset);
  result.sha256 = createHash('sha256').update(result.body || '').digest('hex');
  result.bytes = result.body?.length;
  if (asset.endsWith('.js')) {
    result.localhostReferences = [...new Set((result.body.match(/https?:\/\/(?:localhost|127\.0\.0\.1)[^"'\s)<>]*/g)||[]))];
    result.providerCredentialPatternFound = /AIza[\w-]{30,}|sk-(?:proj-)?[A-Za-z0-9_-]{30,}/.test(result.body);
    result.sameOriginApiReference = result.body.includes('/api/v1');
  }
  delete result.body;
}
for(const type of ['ARTICLE','RESEARCH','DISCUSSION']) await request('/api/v1/content?type='+type+'&limit=1');
await request('/api/v1/search?q=cooling&type=RESEARCH&sort=title&order=asc&limit=5');
await request('/api/v1/content?page=2&limit=2');
await request('/api/v1/topics/cooling/content?limit=2');
await request('/api/v1/content/00000000-0000-4000-8000-000000000000');
await request('/api/v1/assistant/ask',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:'What are the latest developments in liquid cooling and power management?'})});
await request('/api/v1/assistant/ask',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:'zzqvNoMatchingEvidence872343'})});
await request('/api/v1/assistant/ask',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:'What cooling research exists?',filters:{dateFrom:'2026-11-07',dateTo:'2026-01-01'}})});
await writeFile('artifacts/deployment-flows-2026-11-07.json',JSON.stringify(records,null,2));

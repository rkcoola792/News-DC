import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const probe = JSON.parse(await readFile('artifacts/deployment-probe-2026-11-07.json'));
const flows = JSON.parse(await readFile('artifacts/deployment-flows-2026-11-07.json'));
const remote = probe.filter(r=>r.base.startsWith('https'));
const verified = [];
const check = (name, fn) => {fn();verified.push(name);};
check('Remote requests returned expected statuses',()=>{
  for (const r of remote) assert.equal(r.status, r.path.includes('/admin/')?401:r.path.includes('not-a-uuid')||r.path.includes('limit=-1')||r.method==='POST'?400:r.path.includes('does-not-exist')?404:200,r.path);
});
const videos = remote.find(r=>r.path.includes('type=VIDEO')).data;
check('All 21 video records have unique IDs and supported YouTube URLs',()=>{
  assert.equal(videos.data.length,21);
  assert.equal(new Set(videos.data.map(v=>v.id)).size,21);
  assert.ok(videos.data.every(v=>v.contentType==='VIDEO'&&['www.youtube.com','youtube.com','youtu.be'].includes(new URL(v.url).hostname)));
});
check('Page two does not overlap page one',()=>{
  const first=remote.find(r=>r.path==='/api/v1/content?limit=2').data.data.map(v=>v.id);
  const second=flows.find(r=>r.path?.includes('page=2')).data.data;
  assert.ok(second.every(v=>!first.includes(v.id)));
});
check('Research filter and title ordering are respected',()=>{
  const list=flows.find(r=>r.path?.includes('sort=title')).data.data;
  assert.ok(list.every(v=>v.contentType==='RESEARCH'));
  assert.deepEqual(list.map(v=>v.title),list.map(v=>v.title).toSorted());
});
check('Assistant paragraphs cite returned source IDs and safe URLs',()=>{
  const answer=flows.find(r=>r.data?.insufficientEvidence===false).data;
  const ids=new Set(answer.sources.map(s=>s.contentId));
  assert.ok(answer.paragraphs.length>0&&answer.paragraphs.every(p=>p.contentIds.length&&p.contentIds.every(id=>ids.has(id))));
  assert.ok(answer.sources.every(s=>['http:','https:'].includes(new URL(s.url).protocol)));
});
check('Admin response is unauthorized and not cacheable',()=>{
  const result=remote.find(r=>r.path==='/api/v1/admin/metrics');
  assert.equal(result.status,401);assert.equal(result.headers['cache-control'],'no-store');
});
for (const asset of flows.filter(r=>r.sha256)) {
  const body=await (await fetch('http://127.0.0.1:5000'+asset.path)).text();
  check('Identical local and deployed asset: '+asset.path,()=>assert.equal(createHash('sha256').update(body).digest('hex'),asset.sha256));
}
await writeFile('artifacts/deployment-verification-2026-11-07.json',JSON.stringify({verified},null,2));
console.log(JSON.stringify({checks:verified.length,verified},null,2));

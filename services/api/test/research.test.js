import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseResearchFeed, fetchCandidates, sourceDefinitions } from '../src/ingestion/sources.js';
import { normalizeCandidate, isRelevantMetadata } from '../src/ingestion/normalize.js';

const researchFeed = `<?xml version="1.0"?>
<feed xmlns="http://www.w3.org/2005/Atom" xmlns:opensearch="http://a9.com/-/spec/opensearch/1.1/">
  <opensearch:totalResults>1</opensearch:totalResults>
  <entry>
    <id>http://arxiv.org/abs/2611.00001v2</id>
    <title type="text">Data center thermal optimization</title>
    <summary>Source abstract about liquid cooling &amp; energy.</summary>
    <published>2026-11-01T00:00:00Z</published><updated>2026-11-02T00:00:00Z</updated>
    <author><name>First Author</name></author><author><name>Second Author</name></author>
    <link href="http://arxiv.org/pdf/2611.00001v2" title="pdf"/>
    <link href="http://arxiv.org/abs/2611.00001v2" rel="alternate"/>
    <category term="cs.DC"/><category term="cs.PF"/>
    <arxiv:primary_category xmlns:arxiv="http://arxiv.org/schemas/atom" term="cs.DC"/>
    <arxiv:doi xmlns:arxiv="http://arxiv.org/schemas/atom">10.1234/fixture</arxiv:doi>
    <arxiv:journal_ref xmlns:arxiv="http://arxiv.org/schemas/atom">Fixture Journal</arxiv:journal_ref>
  </entry>
</feed>`;

test('research adapter preserves source metadata and selects a versioned HTTPS abstract link', async () => {
  let requests = 0;
  const candidates = await fetchCandidates(sourceDefinitions[2], async (url, options) => {
    requests++;
    assert.equal(url, sourceDefinitions[2].endpoint_url);
    assert.equal(options.redirect, 'error');
    return new Response(researchFeed);
  });
  assert.equal(requests, 1);
  const item = normalizeCandidate(candidates[0]);
  assert.equal(item.type, 'RESEARCH');
  assert.equal(item.url, 'https://arxiv.org/abs/2611.00001v2');
  assert.equal(item.author, 'First Author, Second Author');
  assert.deepEqual(item.metadata.authors, ['First Author', 'Second Author']);
  assert.equal(item.metadata.doi, '10.1234/fixture');
  assert.equal(item.metadata.journalReference, 'Fixture Journal');
  assert.equal(item.metadata.arxivId, '2611.00001v2');
  assert.equal(item.metadata.descriptionOrigin, 'source-abstract');
  assert.equal(item.description, 'Source abstract about liquid cooling & energy.');
  assert.deepEqual(item.tags, ['cs.dc', 'cs.pf']);
  assert.equal(item.metadata.primaryCategory, 'cs.DC');
  assert.equal(isRelevantMetadata(item.title, item.description), true);
});

test('research parsing allows genuine empty results but rejects malformed/error responses', () => {
  assert.deepEqual(
    parseResearchFeed('<feed><opensearch:totalResults>0</opensearch:totalResults></feed>'),
    [],
  );
  for (const response of [
    '<feed><entry>',
    '<html>Unavailable</html>',
    '<feed><opensearch:totalResults>10</opensearch:totalResults></feed>',
    '<feed><entry><id>http://arxiv.org/api/errors#incorrect_id_format</id></entry></feed>',
    researchFeed.replace('http://arxiv.org/abs/2611.00001v2', 'https://unapproved.invalid/paper'),
  ])
    assert.throws(() => parseResearchFeed(response));
});

test('research metadata tolerates absent optional fields and supports legacy paper IDs', () => {
  const [item] = parseResearchFeed(
    '<feed><entry><id>http://arxiv.org/abs/cs/0601001v1</id><title>Data centers</title><author><name>Author</name></author><category term="cs.DC"/></entry></feed>',
  );
  assert.equal(item.author, 'Author');
  assert.equal(item.metadata.doi, null);
  assert.equal(item.publishedAt, null);
  assert.equal(normalizeCandidate(item).type, 'RESEARCH');
});

test('arXiv requests remain serialized and spaced after an upstream failure', async () => {
  const starts = [];
  let active = 0;
  const fetcher = async () => {
    assert.equal(active, 0);
    active++;
    starts.push(Date.now());
    await new Promise((resolve) => setTimeout(resolve, 20));
    active--;
    return starts.length === 1 ? new Response('', { status: 429 }) : new Response(researchFeed);
  };
  const [failed, succeeded] = await Promise.allSettled([
    fetchCandidates(sourceDefinitions[2], fetcher),
    fetchCandidates(sourceDefinitions[2], fetcher),
  ]);
  assert.equal(failed.status, 'rejected');
  assert.equal(succeeded.status, 'fulfilled');
  assert.equal(starts.length, 2);
  assert.ok(starts[1] - starts[0] >= 3000);
});

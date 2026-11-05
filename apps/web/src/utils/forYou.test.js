import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rankForYou, selectFeedItems } from './forYou.js';
import { savePreferences, loadPreferences } from './preferences.js';
const items = [
  { id: 'a', title: 'Alpha', topic: 'AI Compute & GPUs', type: 'Article', summary: 'Compute' },
  { id: 'b', title: 'Beta', topic: 'Cooling', type: 'Video', summary: 'Cooling' },
  { id: 'c', title: 'Gamma', topic: 'Networking', type: 'Discussion', summary: 'Network' },
  { id: 'd', title: 'Delta', topic: 'Cooling', type: 'Research', summary: 'Cooling research' },
];
const ids = (rows) => rows.map((x) => x.id);
const history = [{ contentId: 'b', openedAt: '2026-11-05T09:00:00Z' }];
test('saved topic changes move matching items first without removing other items', () => {
  assert.deepEqual(ids(rankForYou(items, { topics: ['cooling'] })), ['b', 'd', 'a', 'c']);
  assert.deepEqual(ids(rankForYou(items, { topics: ['networking'] })), ['c', 'a', 'b', 'd']);
});
test('format preferences affect ranking and topic plus format ranks first', () => {
  assert.equal(rankForYou(items, { contentTypes: ['DISCUSSION'] })[0].id, 'c');
  assert.deepEqual(ids(rankForYou(items, { topics: ['cooling'], contentTypes: ['RESEARCH'] })), [
    'd',
    'b',
    'a',
    'c',
  ]);
});
test('unread wins only among items with equal preference matches', () => {
  assert.deepEqual(ids(rankForYou(items, { topics: ['cooling'] }, history)), ['d', 'b', 'a', 'c']);
  assert.equal(
    rankForYou(items, { topics: ['cooling'], contentTypes: ['VIDEO'] }, history)[0].id,
    'b',
  );
});
test('empty/reset preferences and empty history preserve original order', () => {
  assert.deepEqual(ids(rankForYou(items, null)), ids(items));
  assert.deepEqual(
    ids(rankForYou(items, { topics: ['invalid'], contentTypes: ['invalid'] })),
    ids(items),
  );
  assert.deepEqual(rankForYou([], {}), []);
});
test('ranking is deterministic and does not mutate source records or order', () => {
  const snapshot = structuredClone(items);
  const first = rankForYou(items, { topics: ['cooling'] }, history);
  assert.deepEqual(first, rankForYou(items, { topics: ['cooling'] }, history));
  assert.deepEqual(items, snapshot);
  assert.equal(first[0], items[3]);
});
test('filters combine before ranking and preferences cannot reintroduce excluded items', () => {
  const results = selectFeedItems(items, {
    topic: 'Cooling',
    type: 'Research',
    query: 'research',
    preferences: { contentTypes: ['VIDEO'] },
  });
  assert.deepEqual(ids(results), ['d']);
  assert.deepEqual(
    selectFeedItems(items, { query: 'missing', preferences: { topics: ['cooling'] } }),
    [],
  );
});
test('title sort overrides personalization and other screens keep their own order', () => {
  assert.deepEqual(
    ids(selectFeedItems(items, { sort: 'title', preferences: { topics: ['cooling'] } })),
    ['a', 'b', 'd', 'c'],
  );
  for (const path of ['/trending', '/search'])
    assert.deepEqual(
      ids(selectFeedItems(items, { path, preferences: { topics: ['cooling'] }, history })),
      ids(items),
    );
  assert.deepEqual(
    ids(
      selectFeedItems(items, {
        path: '/saved',
        saved: ['a', 'd'],
        preferences: { topics: ['cooling'] },
      }),
    ),
    ['a', 'd'],
  );
});
test('reloaded preferences drive the same ordering and clearing history restores ties', () => {
  const values = new Map();
  const storage = { getItem: (k) => values.get(k), setItem: (k, v) => values.set(k, v) };
  savePreferences(storage, { topics: ['cooling'], contentTypes: [] });
  const preferences = loadPreferences(storage);
  assert.deepEqual(ids(rankForYou(items, preferences, history)), ['d', 'b', 'a', 'c']);
  assert.deepEqual(ids(rankForYou(items, preferences, [])), ['b', 'd', 'a', 'c']);
});

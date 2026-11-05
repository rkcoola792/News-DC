import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  PREFERENCES_KEY,
  normalizePreferences,
  loadPreferences,
  savePreferences,
  togglePreference,
} from './preferences.js';
import { topicOptions } from '../data/taxonomy.js';
function memoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}
test('all 14 documented topics have unique IDs', () => {
  assert.equal(topicOptions.length, 14);
  assert.equal(new Set(topicOptions.map((x) => x.id)).size, 14);
});
test('empty or invalid storage defaults to no specific preferences', () => {
  assert.deepEqual(loadPreferences(memoryStorage()), { topics: [], contentTypes: [] });
  assert.deepEqual(loadPreferences({ getItem: () => '{invalid' }), normalizePreferences(null));
  assert.deepEqual(
    loadPreferences({
      getItem: () => {
        throw Error('disabled');
      },
    }),
    normalizePreferences(null),
  );
});
test('unknown IDs and duplicate values are removed', () => {
  assert.deepEqual(
    normalizePreferences({
      topics: ['cooling', 'cooling', 'unknown'],
      contentTypes: ['VIDEO', 'other', 'VIDEO'],
    }),
    { topics: ['cooling'], contentTypes: ['VIDEO'] },
  );
  assert.deepEqual(
    normalizePreferences({ topics: 'cooling', contentTypes: {} }),
    normalizePreferences(null),
  );
});
test('saved preferences survive a fresh read', () => {
  const storage = memoryStorage();
  const draft = { topics: ['cooling', 'networking'], contentTypes: ['ARTICLE', 'RESEARCH'] };
  assert.equal(savePreferences(storage, draft).ok, true);
  assert.deepEqual(loadPreferences(storage), normalizePreferences(draft));
  assert.ok(storage.getItem(PREFERENCES_KEY));
});
test('draft edits leave saved preferences untouched until save', () => {
  const storage = memoryStorage();
  savePreferences(storage, { topics: ['cooling'], contentTypes: [] });
  const saved = loadPreferences(storage);
  const draft = togglePreference(saved, 'topics', 'networking');
  assert.deepEqual(saved.topics, ['cooling']);
  assert.deepEqual(loadPreferences(storage).topics, ['cooling']);
  assert.deepEqual(draft.topics, ['cooling', 'networking']);
  assert.deepEqual(togglePreference(draft, 'topics', 'cooling').topics, ['networking']);
});
test('reset draft is reversible until saved and persists empty choices on save', () => {
  const storage = memoryStorage();
  savePreferences(storage, { topics: ['cooling'], contentTypes: ['VIDEO'] });
  const reset = normalizePreferences(null);
  assert.deepEqual(loadPreferences(storage).topics, ['cooling']);
  savePreferences(storage, reset);
  assert.deepEqual(loadPreferences(storage), { topics: [], contentTypes: [] });
});
test('failed writes are reported and cannot replace stored preferences', () => {
  const storage = memoryStorage();
  savePreferences(storage, { topics: ['cooling'], contentTypes: [] });
  const unavailable = {
    getItem: storage.getItem,
    setItem: () => {
      throw Error('quota');
    },
  };
  assert.equal(savePreferences(unavailable, { topics: ['networking'] }).ok, false);
  assert.deepEqual(loadPreferences(storage).topics, ['cooling']);
});

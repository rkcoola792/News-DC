import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  HISTORY_KEY,
  HISTORY_LIMIT,
  loadHistory,
  normalizeHistory,
  recordOpening,
  saveHistory,
} from './readingHistory.js';

test('reopening an item moves it to the front without duplicates', () => {
  let history = recordOpening([], 'a', '2026-11-05T09:00:00Z');
  history = recordOpening(history, 'b', '2026-11-05T10:00:00Z');
  history = recordOpening(history, 'a', '2026-11-05T11:00:00Z');
  assert.deepEqual(
    history.map((x) => x.contentId),
    ['a', 'b'],
  );
  assert.equal(history[0].openedAt, '2026-11-05T11:00:00Z');
});
test('malformed stored records are discarded', () => {
  assert.deepEqual(normalizeHistory({}), []);
  assert.deepEqual(normalizeHistory([null, {}, { contentId: 'a', openedAt: 'invalid' }]), []);
  assert.deepEqual(loadHistory({ getItem: () => '{broken' }), []);
  assert.deepEqual(
    loadHistory({
      getItem: () => {
        throw Error('disabled');
      },
    }),
    [],
  );
});
test('history is bounded and keeps recent openings', () => {
  let history = [];
  for (let i = 0; i < HISTORY_LIMIT + 10; i++) history = recordOpening(history, String(i));
  assert.equal(history.length, HISTORY_LIMIT);
  assert.equal(history[0].contentId, String(HISTORY_LIMIT + 9));
});
test('history survives reload and clearing removes persisted entries', () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key),
    setItem: (key, value) => values.set(key, value),
  };
  const history = recordOpening([], 'a');
  assert.equal(saveHistory(storage, history), true);
  assert.deepEqual(loadHistory(storage), history);
  saveHistory(storage, []);
  assert.deepEqual(JSON.parse(values.get(HISTORY_KEY)), []);
  assert.deepEqual(loadHistory(storage), []);
});
test('storage failures are reported to callers', () => {
  assert.equal(
    saveHistory(
      {
        setItem: () => {
          throw Error('quota');
        },
      },
      [],
    ),
    false,
  );
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadBookmarks, saveBookmarks } from './bookmarks.js';

test('malformed bookmark storage recovers to an empty list', () => {
  for (const raw of [null, '{}', '42', 'true', '"item"', '{invalid', 'null']) {
    assert.deepEqual(loadBookmarks({ getItem: () => raw }), []);
  }
  assert.deepEqual(
    loadBookmarks({ getItem: () => JSON.stringify(['one', null, 42, '', 'one', 'two']) }),
    ['one', 'two'],
  );
});

test('bookmark updates survive a fresh read, including removal', () => {
  let raw = null;
  const storage = {
    getItem: () => raw,
    setItem: (_key, value) => {
      raw = value;
    },
  };
  assert.equal(saveBookmarks(storage, ['one', 'two']), true);
  assert.deepEqual(loadBookmarks(storage), ['one', 'two']);
  assert.equal(saveBookmarks(storage, []), true);
  assert.deepEqual(loadBookmarks(storage), []);
});

test('denied reads and failed writes are handled without throwing', () => {
  const storage = {
    getItem: () => {
      throw new Error('Storage denied');
    },
    setItem: () => {
      throw new Error('Quota exceeded');
    },
  };
  assert.deepEqual(loadBookmarks(storage), []);
  assert.equal(saveBookmarks(storage, ['one']), false);
});

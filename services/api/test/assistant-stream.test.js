import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from '../src/app.js';
import { AIError } from '../src/ai/limits.js';

const logger = { info() {}, error() {} };
const valid = { answer: 'A source-checked answer.', paragraphs: [], sources: [], cached: false };
async function serve(ask, fn) {
  const app = createApp({ db: {}, logger, runtime: { assistant: { ask } } });
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const url = `http://127.0.0.1:${server.address().port}/api/v1/assistant/ask`;
  try {
    await fn(url);
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
}
const options = (body = { question: 'Liquid cooling?' }) => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
  body: JSON.stringify(body),
});

test('assistant sends progress before generation finishes, then one validated answer and done', async () => {
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  await serve(
    async (_input, { onStatus }) => {
      onStatus('Checking evidence…');
      await gate;
      return valid;
    },
    async (url) => {
      const response = await fetch(url, options());
      assert.match(response.headers.get('content-type'), /text\/event-stream/);
      assert.equal(response.headers.get('x-accel-buffering'), 'no');
      const reader = response.body.getReader(),
        first = await reader.read();
      const decoder = new TextDecoder();
      let text = decoder.decode(first.value);
      assert.match(text, /event: status/);
      assert.doesNotMatch(text, /event: answer/);
      release();
      while (true) {
        const chunk = await reader.read();
        if (chunk.done) break;
        text += decoder.decode(chunk.value);
      }
      assert.equal((text.match(/event: answer/g) || []).length, 1);
      assert.match(text, /A source-checked answer/);
      assert.match(text, /event: done/);
    },
  );
});
test('stream validates input before headers and retains the existing JSON contract', async () => {
  let calls = 0;
  await serve(
    async () => {
      calls++;
      return valid;
    },
    async (url) => {
      const invalid = await fetch(url, options({ question: 'x' }));
      assert.equal(invalid.status, 400);
      assert.match(invalid.headers.get('content-type'), /application\/json/);
      assert.equal(calls, 0);
      const request = options();
      delete request.headers.Accept;
      const normal = await fetch(url, request);
      assert.deepEqual(await normal.json(), valid);
    },
  );
});
test('stream errors never expose private errors or an answer', async () => {
  for (const error of [
    Error('private credential details'),
    new AIError('AI_BUSY', 'Try again shortly.'),
  ]) {
    await serve(
      async () => {
        throw error;
      },
      async (url) => {
        const text = await (await fetch(url, options())).text();
        assert.match(text, /event: error/);
        assert.doesNotMatch(text, /private credential|event: answer|event: done/);
        if (error instanceof AIError) assert.match(text, /AI_BUSY/);
      },
    );
  }
});
test('disconnected clients do not trigger a second assistant call', async () => {
  let calls = 0,
    release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  await serve(
    async () => {
      calls++;
      await gate;
      return valid;
    },
    async (url) => {
      const controller = new AbortController();
      const response = await fetch(url, { ...options(), signal: controller.signal });
      await response.body.getReader().read();
      controller.abort();
      release();
      await new Promise((resolve) => setImmediate(resolve));
      assert.equal(calls, 1);
    },
  );
});

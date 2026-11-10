import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readAssistantEvents, revealAnswer, visibleAnswer } from './assistantStream.js';

const stream = (text, bytes = 1) => {
  const encoded = new TextEncoder().encode(text);
  return new ReadableStream({
    start(controller) {
      for (let i = 0; i < encoded.length; i += bytes)
        controller.enqueue(encoded.slice(i, i + bytes));
      controller.close();
    },
  });
};
test('SSE decoder handles split UTF-8, CRLF, comments and coalesced events', async () => {
  for (const bytes of [1, 4096]) {
    const events = [];
    await readAssistantEvents(
      stream(
        ': heartbeat\r\n\r\nevent: status\r\ndata: {"message":"Searching…"}\r\n\r\nevent: answer\ndata: {"answer":"Cooling 🌊"}\n\nevent: done\ndata: {}\n\n',
        bytes,
      ),
      (event, data) => events.push({ event, data }),
    );
    assert.deepEqual(
      events.map((item) => item.event),
      ['status', 'answer', 'done'],
    );
    assert.equal(events[1].data.answer, 'Cooling 🌊');
  }
});
test('SSE decoder rejects interruptions, safe error events and malformed frames', async () => {
  await assert.rejects(
    readAssistantEvents(stream('event: status\ndata: {}\n\n'), () => {}),
    /interrupted/,
  );
  await assert.rejects(
    readAssistantEvents(stream('event: error\ndata: {"message":"Please retry."}\n\n'), () => {}),
    /Please retry/,
  );
  await assert.rejects(
    readAssistantEvents(stream('event: answer\ndata: invalid\n\n'), () => {}),
    SyntaxError,
  );
});
const answer = {
  insufficientEvidence: false,
  paragraphs: [
    { text: 'First paragraph.', contentIds: ['a'] },
    { text: 'Second paragraph.', contentIds: ['b'] },
  ],
};
test('progressive display exposes citations only after the associated paragraph is complete', () => {
  const partial = visibleAnswer(answer, 4);
  assert.equal(partial.paragraphs[0].text, 'Firs');
  assert.deepEqual(partial.paragraphs[0].contentIds, []);
  const next = visibleAnswer(answer, 18);
  assert.deepEqual(next.paragraphs[0].contentIds, ['a']);
  assert.deepEqual(next.paragraphs[1].contentIds, []);
  assert.equal(answer.paragraphs[0].text, 'First paragraph.');
  assert.equal(
    visibleAnswer({ insufficientEvidence: true, answer: 'Not enough evidence.' }, 3).answer,
    'Not',
  );
});
test('display respects reduced motion and aborts promptly without later updates', async () => {
  let values = [];
  await revealAnswer(answer, { reducedMotion: true, onProgress: (value) => values.push(value) });
  assert.deepEqual(values, [33]);
  values = [];
  const controller = new AbortController();
  await assert.rejects(
    revealAnswer(answer, {
      signal: controller.signal,
      onProgress: (value) => {
        values.push(value);
        controller.abort();
      },
    }),
    { name: 'AbortError' },
  );
  assert.equal(values.length, 1);
});

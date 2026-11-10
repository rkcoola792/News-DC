import { apiBase } from './api.js';

// Incremental SSE decoding handles split UTF-8 characters and arbitrary network chunks.
export async function readAssistantEvents(body, onEvent) {
  const reader = body.getReader(),
    decoder = new TextDecoder();
  let pending = '',
    done = false;
  try {
    while (true) {
      const part = await reader.read();
      pending += decoder.decode(part.value, { stream: !part.done });
      if (pending.length > 256000) throw Error('The answer exceeded the supported size.');
      let boundary;
      while ((boundary = pending.search(/\r?\n\r?\n/)) !== -1) {
        const frame = pending.slice(0, boundary);
        pending = pending.slice(boundary + (pending[boundary] === '\r' ? 4 : 2));
        let event = 'message';
        const lines = [];
        for (const line of frame.split(/\r?\n/)) {
          if (line.startsWith('event:')) event = line.slice(6).trim();
          if (line.startsWith('data:')) lines.push(line.slice(5).trimStart());
        }
        if (!lines.length) continue;
        const value = JSON.parse(lines.join('\n'));
        if (event === 'error') throw Error(value.message || 'The answer could not be completed.');
        if (event === 'done') done = true;
        await onEvent(event, value);
      }
      if (part.done) break;
    }
    if (!done) throw Error('The response was interrupted. Please try again.');
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

export async function askAssistant(body, { signal, onStatus, onAnswer }) {
  const response = await fetch(apiBase() + '/assistant/ask', {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw Error(data.error?.message || `Request failed (${response.status})`);
  }
  if (!response.headers.get('content-type')?.includes('text/event-stream') || !response.body)
    throw Error('The server did not return a streaming response. Refresh and try again.');
  let received = false;
  await readAssistantEvents(response.body, async (event, data) => {
    if (signal?.aborted) throw new DOMException('Stopped', 'AbortError');
    if (event === 'status') onStatus(data.message);
    if (event === 'answer') {
      if (received) throw Error('Duplicate answer received. Please try again.');
      received = true;
      await onAnswer(data);
    }
  });
  if (!received) throw Error('No answer was received. Please try again.');
}

export function answerLength(answer) {
  return answer.insufficientEvidence
    ? answer.answer.length
    : answer.paragraphs.reduce((sum, p) => sum + p.text.length, 0);
}

export function visibleAnswer(answer, count) {
  if (answer.insufficientEvidence) return { ...answer, answer: answer.answer.slice(0, count) };
  let remaining = count;
  return {
    ...answer,
    paragraphs: answer.paragraphs
      .map((paragraph) => {
        const text = paragraph.text.slice(0, Math.max(0, remaining));
        remaining -= paragraph.text.length;
        return {
          ...paragraph,
          text,
          contentIds: text.length === paragraph.text.length ? paragraph.contentIds : [],
        };
      })
      .filter((paragraph) => paragraph.text.length),
  };
}

// Display pacing is separate from model generation; no raw, unvalidated tokens are shown.
export async function revealAnswer(answer, { signal, onProgress, reducedMotion = false }) {
  if (signal?.aborted) throw new DOMException('Stopped', 'AbortError');
  const total = answerLength(answer);
  if (reducedMotion) {
    onProgress(total);
    return;
  }
  for (let visible = 0; visible < total;) {
    if (signal?.aborted) throw new DOMException('Stopped', 'AbortError');
    visible = Math.min(total, visible + Math.max(8, Math.ceil(total / 90)));
    onProgress(visible);
    if (visible < total)
      await new Promise((resolve, reject) => {
        const stop = () => {
          clearTimeout(timer);
          reject(new DOMException('Stopped', 'AbortError'));
        };
        const timer = setTimeout(() => {
          signal?.removeEventListener('abort', stop);
          resolve();
        }, 16);
        signal?.addEventListener('abort', stop, { once: true });
        if (signal?.aborted) {
          signal.removeEventListener('abort', stop);
          stop();
        }
      });
  }
}

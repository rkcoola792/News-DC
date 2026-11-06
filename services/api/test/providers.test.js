import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from '../src/app.js';
import { createAIProviders, probeTask } from '../src/ai/providers.js';

const config = {
  enabled: true,
  geminiKey: 'fake-gemini-secret',
  openaiKey: 'fake-openai-secret',
  geminiModel: 'gemini-3.5-flash-lite',
  openaiModel: 'gpt-5.4-mini',
};
const geminiSuccess = () =>
  new Response(
    JSON.stringify({
      candidates: [{ finishReason: 'STOP', content: { parts: [{ text: '{"ok":true}' }] } }],
      usageMetadata: { promptTokenCount: 20, candidatesTokenCount: 5 },
    }),
  );
const openaiSuccess = () =>
  new Response(
    JSON.stringify({
      status: 'completed',
      output: [{ content: [{ type: 'output_text', text: '{"ok":true}' }] }],
      usage: { input_tokens: 20, output_tokens: 5 },
    }),
  );
function memoryLimits() {
  const calls = [];
  return {
    calls,
    reserve: async (provider, model) => {
      const call = { id: String(calls.length), provider, model };
      calls.push(call);
      return call;
    },
    finish: async (call, result) => {
      call.result = result;
    },
    status: async () => ({}),
  };
}

test('Gemini success never calls OpenAI and secrets stay in request headers', async () => {
  const limits = memoryLimits();
  const gateway = createAIProviders(
    {},
    {
      config,
      limits,
      fetcher: async (url, options) => {
        assert.ok(url.startsWith('https://generativelanguage.googleapis.com/'));
        assert.equal(options.headers['x-goog-api-key'], config.geminiKey);
        assert.ok(!url.includes(config.geminiKey));
        assert.ok(!options.body.includes('secret'));
        return geminiSuccess();
      },
    },
  );
  const result = await gateway.generate(probeTask);
  assert.equal(result.provider, 'gemini');
  assert.equal(result.fallbackUsed, false);
  assert.equal(limits.calls.length, 1);
  assert.equal(limits.calls[0].result.status, 'COMPLETED');
  assert.ok(!JSON.stringify(await gateway.status()).includes('secret'));
});

test('two Gemini retries back off before one successful OpenAI fallback', async () => {
  const providers = [],
    delays = [],
    limits = memoryLimits();
  const gateway = createAIProviders(
    {},
    {
      config,
      limits,
      sleep: async (ms) => delays.push(ms),
      fetcher: async (url, options) => {
        const provider = url.includes('googleapis') ? 'gemini' : 'openai';
        providers.push(provider);
        if (provider === 'gemini') return new Response('{}', { status: 503 });
        const body = JSON.parse(options.body);
        assert.equal(body.store, false);
        assert.equal(body.max_output_tokens, 1024);
        assert.deepEqual(body.reasoning, { effort: 'none' });
        return openaiSuccess();
      },
    },
  );
  const result = await gateway.generate(probeTask);
  assert.deepEqual(providers, ['gemini', 'gemini', 'gemini', 'openai']);
  assert.deepEqual(delays, [2000, 4000]);
  assert.equal(result.fallbackUsed, true);
  assert.equal(result.attempts.length, 4);
});

test('permanent Gemini errors skip futile retries; daily quota does not loop', async () => {
  for (const [status, body] of [
    [401, {}],
    [404, {}],
    [401, 'upstream returned a non-JSON error page'],
    [429, { error: { message: 'RequestsPerDay quota exceeded' } }],
  ]) {
    let calls = 0;
    const gateway = createAIProviders(
      {},
      {
        config,
        limits: memoryLimits(),
        sleep: async () => assert.fail('must not retry'),
        fetcher: async (url) => {
          calls++;
          return url.includes('googleapis')
            ? new Response(typeof body === 'string' ? body : JSON.stringify(body), { status })
            : openaiSuccess();
        },
      },
    );
    assert.equal((await gateway.generate(probeTask)).provider, 'openai');
    assert.equal(calls, 2);
  }
});

test('safety refusal never falls back; busy state resets after failures', async () => {
  let calls = 0;
  const gateway = createAIProviders(
    {},
    {
      config,
      limits: memoryLimits(),
      fetcher: async () => {
        calls++;
        return new Response(JSON.stringify({ promptFeedback: { blockReason: 'SAFETY' } }));
      },
    },
  );
  await assert.rejects(gateway.generate(probeTask), { code: 'AI_REFUSED' });
  await assert.rejects(gateway.generate(probeTask), { code: 'AI_REFUSED' });
  assert.equal(calls, 2);
  assert.equal((await gateway.status()).busy, false);
});

test('disabled, oversized and unavailable accounting paths fail before provider calls', async () => {
  const fetcher = async () => assert.fail('provider must not be called');
  await assert.rejects(
    createAIProviders(
      {},
      { config: { ...config, enabled: false }, limits: memoryLimits(), fetcher },
    ).generate(probeTask),
    { code: 'AI_DISABLED' },
  );
  await assert.rejects(
    createAIProviders({}, { config, limits: memoryLimits(), fetcher }).generate({
      ...probeTask,
      input: 'x'.repeat(21000),
    }),
    { code: 'AI_INPUT_LIMIT' },
  );
  const limits = {
    ...memoryLimits(),
    reserve: async () => {
      throw Error('Database unavailable');
    },
  };
  await assert.rejects(
    createAIProviders({}, { config, limits, fetcher }).generate(probeTask),
    /Database unavailable/,
  );
});

test('malformed model output is rejected and OpenAI is attempted only once', async () => {
  let count = 0;
  const gateway = createAIProviders(
    {},
    {
      config,
      limits: memoryLimits(),
      sleep: async () => {},
      fetcher: async () => {
        count++;
        return new Response('{}');
      },
    },
  );
  await assert.rejects(gateway.generate(probeTask), { code: 'AI_RESPONSE_INVALID' });
  assert.equal(count, 4);
});

test('provider retry-after is respected without a long retry loop', async () => {
  for (const seconds of [3, 60]) {
    const delays = [],
      calls = [];
    const gateway = createAIProviders(
      {},
      {
        config,
        limits: memoryLimits(),
        sleep: async (ms) => delays.push(ms),
        fetcher: async (url) => {
          calls.push(url.includes('googleapis') ? 'gemini' : 'openai');
          if (calls.length === 1)
            return new Response('{}', { status: 429, headers: { 'Retry-After': String(seconds) } });
          return url.includes('googleapis') ? geminiSuccess() : openaiSuccess();
        },
      },
    );
    const result = await gateway.generate(probeTask);
    assert.equal(result.provider, seconds === 3 ? 'gemini' : 'openai');
    assert.deepEqual(delays, seconds === 3 ? [3000] : []);
    assert.equal(calls.length, 2);
  }
});

test('simultaneous provider checks cannot bypass the request guard', async () => {
  let finish,
    calls = 0;
  const gateway = createAIProviders(
    {},
    {
      config,
      limits: memoryLimits(),
      fetcher: () => {
        calls++;
        return new Promise((resolve) => {
          finish = () => resolve(geminiSuccess());
        });
      },
    },
  );
  const first = gateway.generate(probeTask);
  await Promise.resolve();
  await assert.rejects(gateway.generate(probeTask), { code: 'AI_BUSY' });
  assert.equal(calls, 1);
  finish();
  await first;
  assert.equal((await gateway.status()).busy, false);
});

test('provider checks require operator authorization and reject arbitrary prompts', async () => {
  let calls = 0;
  const server = createApp({
    db: {},
    adminKey: 'operator',
    logger: { info() {}, error() {} },
    aiProviders: {
      status: async () => ({ enabled: true }),
      generate: async () => {
        calls++;
        return { provider: 'gemini' };
      },
    },
  }).listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}/api/v1/admin/ai/providers`;
  try {
    assert.equal((await fetch(base)).status, 401);
    assert.equal((await fetch(base + '/check', { method: 'POST' })).status, 401);
    const headers = { Authorization: 'Bearer operator', 'Content-Type': 'application/json' };
    assert.equal((await fetch(base, { headers })).status, 200);
    assert.equal(
      (
        await fetch(base + '/check', {
          method: 'POST',
          headers,
          body: JSON.stringify({ prompt: 'anything' }),
        })
      ).status,
      400,
    );
    assert.equal(
      (await fetch(base + '/check', { method: 'POST', headers, body: '{}' })).status,
      200,
    );
    assert.equal(calls, 1);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

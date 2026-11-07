import { AIError, createAILimits } from './limits.js';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export function aiConfig(env = process.env) {
  return {
    enabled: env.AI_PROVIDER_ENABLED === 'true',
    geminiKey: env.GEMINI_API_KEY?.trim(),
    openaiKey: env.OPENAI_API_KEY?.trim(),
    geminiModel: 'gemini-3.5-flash-lite',
    openaiModel: 'gpt-5.4-mini',
  };
}

function failure(code, retryable = false) {
  const error = new AIError(code);
  error.retryable = retryable;
  return error;
}

async function send(provider, config, task, fetcher) {
  const gemini = provider === 'gemini';
  const body = gemini
    ? {
        systemInstruction: { parts: [{ text: task.instructions }] },
        contents: [{ role: 'user', parts: [{ text: task.input }] }],
        generationConfig: {
          maxOutputTokens: 1024,
          responseMimeType: 'application/json',
          responseJsonSchema: task.schema,
        },
      }
    : {
        model: config.openaiModel,
        instructions: task.instructions,
        input: task.input,
        reasoning: { effort: 'none' },
        max_output_tokens: 1024,
        store: false,
        text: {
          format: { type: 'json_schema', name: 'newsdc_result', strict: true, schema: task.schema },
        },
      };
  const serialized = JSON.stringify(body);
  // Reviewed OpenAI pricing/reservation applies only to this bounded model/body/output.
  if (Buffer.byteLength(serialized, 'utf8') > 24000)
    throw new AIError('AI_INPUT_LIMIT', 'AI input exceeds the demo size limit.');
  let response;
  try {
    response = await fetcher(
      gemini
        ? `https://generativelanguage.googleapis.com/v1beta/models/${config.geminiModel}:generateContent`
        : 'https://api.openai.com/v1/responses',
      {
        method: 'POST',
        redirect: 'error',
        signal: AbortSignal.timeout(20000),
        headers: {
          'Content-Type': 'application/json',
          ...(gemini
            ? { 'x-goog-api-key': config.geminiKey }
            : { Authorization: `Bearer ${config.openaiKey}` }),
        },
        body: serialized,
      },
    );
  } catch {
    throw failure('AI_NETWORK', true);
  }
  let raw;
  try {
    let size = 0;
    const chunks = [];
    for await (const chunk of response.body) {
      size += chunk.length;
      if (size > 256000) throw Error('Response too large');
      chunks.push(chunk);
    }
    raw = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    if (response && !response.ok)
      throw failure(
        `AI_UPSTREAM_${response.status}`,
        [408, 429, 500, 502, 503, 504].includes(response.status),
      );
    throw failure('AI_RESPONSE_INVALID', true);
  }
  if (!response.ok) {
    const dailyQuota =
      response.status === 429 && /per.?day|daily|quotaValue"\s*:\s*"?0/i.test(JSON.stringify(raw));
    const error = failure(
      dailyQuota ? 'AI_PROVIDER_QUOTA' : `AI_UPSTREAM_${response.status}`,
      !dailyQuota && [408, 429, 500, 502, 503, 504].includes(response.status),
    );
    const retryAfter = response.headers.get('retry-after');
    const delay =
      retryAfter == null
        ? 0
        : /^\d+$/.test(retryAfter)
          ? Number(retryAfter) * 1000
          : Math.max(0, Date.parse(retryAfter) - Date.now());
    if (Number.isFinite(delay) && delay > 10000) error.retryable = false;
    else if (Number.isFinite(delay)) error.retryAfterMs = delay;
    throw error;
  }
  if (gemini) {
    const candidate = raw.candidates?.[0];
    if (
      raw.promptFeedback?.blockReason ||
      ['SAFETY', 'RECITATION', 'BLOCKLIST', 'PROHIBITED_CONTENT', 'SPII'].includes(
        candidate?.finishReason,
      )
    )
      throw failure('AI_REFUSED');
    if (candidate?.finishReason !== 'STOP') throw failure('AI_RESPONSE_INVALID', true);
    const text = candidate.content?.parts
      ?.filter((part) => !part.thought)
      .map((part) => part.text || '')
      .join('');
    return {
      text,
      usage: {
        inputTokens: raw.usageMetadata?.promptTokenCount,
        outputTokens:
          (raw.usageMetadata?.candidatesTokenCount ?? 0) +
          (raw.usageMetadata?.thoughtsTokenCount ?? 0),
      },
    };
  }
  if (raw.output?.some((output) => output.content?.some((part) => part.type === 'refusal')))
    throw failure('AI_REFUSED');
  if (raw.status !== 'completed') throw failure('AI_RESPONSE_INVALID');
  return {
    text: raw.output
      ?.flatMap((output) => output.content || [])
      .filter((part) => part.type === 'output_text')
      .map((part) => part.text)
      .join(''),
    usage: { inputTokens: raw.usage?.input_tokens, outputTokens: raw.usage?.output_tokens },
  };
}

export function createAIProviders(
  db,
  { config = aiConfig(), fetcher = fetch, sleep = wait, limits = createAILimits(db) } = {},
) {
  let busy = false;
  return {
    isEnabled: () => config.enabled,
    isBusy: () => busy,
    async status() {
      return {
        enabled: config.enabled,
        primary: 'gemini',
        fallback: 'openai',
        geminiConfigured: !!config.geminiKey,
        openaiConfigured: !!config.openaiKey,
        geminiModel: config.geminiModel,
        openaiModel: config.openaiModel,
        geminiRetries: 2,
        openaiAttempts: 1,
        busy,
        ...(await limits.status()),
      };
    },
    async generate(task) {
      if (!config.enabled) throw new AIError('AI_DISABLED', 'AI provider calls are disabled.');
      if (busy) throw new AIError('AI_BUSY', 'Another AI request is running. Try again shortly.');
      if (!config.geminiKey)
        throw new AIError('AI_NOT_CONFIGURED', 'Configure the primary Gemini key on the server.');
      if (
        typeof task.input !== 'string' ||
        typeof task.instructions !== 'string' ||
        !task.schema ||
        Buffer.byteLength(JSON.stringify(task.schema) + task.input + task.instructions) > 20000
      )
        throw new AIError('AI_INPUT_LIMIT', 'AI input exceeds the demo size limit.');
      busy = true;
      const attempts = [];
      let last;
      try {
        for (const provider of ['gemini', 'openai']) {
          if (provider === 'openai' && !config.openaiKey) break;
          const model = provider === 'gemini' ? config.geminiModel : config.openaiModel;
          for (let attempt = 0; attempt < (provider === 'gemini' ? 3 : 1); attempt++) {
            const call = await limits.reserve(provider, model);
            let result;
            try {
              result = await send(provider, config, task, fetcher);
              let value;
              try {
                value = task.validate(JSON.parse(result.text));
              } catch {
                throw failure('AI_RESPONSE_INVALID', true);
              }
              await limits.finish(call, { status: 'COMPLETED', usage: result.usage });
              attempts.push({ provider, attempt: attempt + 1, status: 'COMPLETED' });
              return {
                value,
                provider,
                model,
                fallbackUsed: provider === 'openai',
                attempts,
                usage: result.usage,
              };
            } catch (error) {
              // Storage failures fail closed; never send another call without a durable allowance.
              if (!(error instanceof AIError)) throw error;
              last = error;
              error.model = model;
              await limits.finish(call, {
                status: 'FAILED',
                usage: result?.usage,
                errorCode: error.code,
              });
              attempts.push({ provider, attempt: attempt + 1, status: 'FAILED', code: error.code });
              if (error.code === 'AI_REFUSED' || error.code === 'AI_INPUT_LIMIT') throw error;
              if (!error.retryable) break;
              if (provider === 'gemini' && attempt < 2)
                await sleep(Math.max(2000 * 2 ** attempt, error.retryAfterMs || 0));
            }
          }
        }
        throw last || new AIError('AI_UNAVAILABLE');
      } catch (error) {
        if (error instanceof AIError) error.attempts = attempts;
        throw error;
      } finally {
        busy = false;
      }
    },
  };
}

export const probeTask = {
  instructions: 'Return only the requested JSON object. This is a provider connectivity check.',
  input: 'Set ok to true.',
  schema: {
    type: 'object',
    properties: { ok: { type: 'boolean' } },
    required: ['ok'],
    additionalProperties: false,
  },
  validate(value) {
    if (value?.ok !== true || Object.keys(value).length !== 1) throw Error('Invalid probe result');
    return { ok: true };
  },
};

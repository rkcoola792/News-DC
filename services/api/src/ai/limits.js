export class AIError extends Error {
  constructor(code, message = 'AI provider is temporarily unavailable.') {
    super(message);
    this.code = code;
    this.status = code === 'AI_BUSY' ? 409 : 503;
  }
}

export function createAILimits(db) {
  return {
    async reserve(provider, model) {
      // Reserve before sending; unknown/failed charges remain reserved across restarts.
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          return await db.$transaction(
            async (tx) => {
              const day = new Date().toISOString().slice(0, 10);
              await tx.ai_provider_daily.upsert({
                where: { day },
                create: { day, requests: 1 },
                update: { requests: { increment: 1 } },
              });
              const reserve = provider === 'openai' ? 50000 : 0;
              if (reserve) {
                await tx.ai_provider_budget.upsert({
                  where: { id: 'openai-demo' },
                  create: { id: 'openai-demo', reserved_microusd: reserve },
                  update: { reserved_microusd: { increment: reserve } },
                });
              }
              return tx.ai_provider_calls.create({
                data: { provider, model, reserved_microusd: reserve },
              });
            },
            { isolationLevel: 'Serializable' },
          );
        } catch (error) {
          if (error.code !== 'P2034' || attempt === 2) throw error;
        }
      }
    },
    async finish(call, { status, usage, errorCode = null }) {
      // Conservative upper bound is retained if billing usage is absent or ambiguous.
      const input = usage?.inputTokens,
        output = usage?.outputTokens;
      const valid =
        Number.isInteger(input) &&
        input >= 0 &&
        input <= 32000 &&
        Number.isInteger(output) &&
        output >= 0 &&
        output <= 1024;
      const charge =
        call.provider === 'openai' && valid
          ? Math.min(call.reserved_microusd, Math.ceil(input * 0.75 + output * 4.5))
          : call.reserved_microusd;
      await db.$transaction(async (tx) => {
        // Conditional update makes finalization idempotent; never double-refund.
        const completed = await tx.ai_provider_calls.updateMany({
          where: { id: call.id, status: 'RESERVED' },
          data: {
            status,
            ended_at: new Date(),
            error_code: errorCode,
            ...(valid ? { input_tokens: input, output_tokens: output } : {}),
          },
        });
        if (completed.count && call.provider === 'openai' && charge < call.reserved_microusd)
          await tx.ai_provider_budget.update({
            where: { id: 'openai-demo' },
            data: { reserved_microusd: { decrement: call.reserved_microusd - charge } },
          });
      });
    },
    async status() {
      const [budget, daily, calls] = await Promise.all([
        db.ai_provider_budget.findUnique({ where: { id: 'openai-demo' } }),
        db.ai_provider_daily.findUnique({ where: { day: new Date().toISOString().slice(0, 10) } }),
        db.ai_provider_calls.findMany({ orderBy: { created_at: 'desc' }, take: 10 }),
      ]);
      return {
        openaiCapUsd: null,
        openaiUsedOrReservedUsd: (budget?.reserved_microusd || 0) / 1000000,
        dailyRequestLimit: null,
        requestsToday: daily?.requests || 0,
        calls,
      };
    },
  };
}

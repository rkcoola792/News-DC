import { enrichmentEligibility } from './enrichment-input.js';

export function createAutomation(
  db,
  enrichment,
  providers,
  assistant,
  trends,
  { enabled = false, interval = 5000, logger = console } = {},
) {
  let busy = false,
    stopped = false,
    timer,
    paused = false,
    lastError = null,
    lastTrendRefresh = 0,
    refreshRequested = true;
  async function tick() {
    if (stopped || busy || !enabled || !providers.isEnabled()) return;
    busy = true;
    try {
      paused =
        (await db.app_settings.findUnique({ where: { key: 'auto-enrichment' } }))?.value?.paused ===
        true;
      if (paused || enrichment.isBusy() || providers.isBusy() || assistant.isBusy()) return;
      lastError = null;
      const rows = await db.content_items.findMany({
        where: { ai_status: 'PENDING' },
        include: { publishers: true },
        take: 10,
        orderBy: [{ published_at: { sort: 'desc', nulls: 'last' } }, { id: 'asc' }],
      });
      if (rows.length) {
        const thin = rows.filter((row) => enrichmentEligibility(row));
        await enrichment.run(thin.length ? thin.map((row) => row.id) : [rows[0].id]);
        refreshRequested = true;
      } else if (
        (refreshRequested || Date.now() - lastTrendRefresh > 3600000) &&
        !trends.isBusy()
      ) {
        refreshRequested = false;
        lastTrendRefresh = Date.now();
        try {
          await trends.refresh();
        } catch (error) {
          lastError = error.code || 'TREND_REFRESH_FAILED';
        }
      }
    } catch (error) {
      lastError = error.code || 'AUTOMATION_FAILED';
      logger.error(JSON.stringify({ event: 'automatic_enrichment_failed', code: lastError }));
    } finally {
      busy = false;
    }
  }
  return {
    tick,
    wake() {
      refreshRequested = true;
      void tick();
    },
    start() {
      stopped = false;
      timer = setInterval(() => void tick(), Math.max(1000, interval));
      timer.unref?.();
      void tick();
      return () => {
        stopped = true;
        clearInterval(timer);
      };
    },
    async pause(value) {
      await db.app_settings.upsert({
        where: { key: 'auto-enrichment' },
        create: { key: 'auto-enrichment', value: { paused: value } },
        update: { value: { paused: value }, updated_at: new Date() },
      });
      paused = value;
      if (!value) void tick();
    },
    async status() {
      const setting = await db.app_settings.findUnique({ where: { key: 'auto-enrichment' } });
      const counts = await db.content_items.groupBy({ by: ['ai_status'], _count: { _all: true } });
      return {
        enabled: enabled && providers.isEnabled(),
        paused: setting?.value?.paused === true,
        busy,
        lastError,
        intervalMs: Math.max(1000, interval),
        counts: counts.map((row) => ({ status: row.ai_status, count: row._count._all })),
      };
    },
  };
}

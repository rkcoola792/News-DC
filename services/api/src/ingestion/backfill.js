import { sourceDefinitions, researchPageURL } from './sources.js';
import { ingestSource } from './service.js';
import { AIError } from '../ai/limits.js';
export function createBackfill(db, automation, logger = console, { ingest = ingestSource } = {}) {
  let busy = false;
  const key = 'research-backfill';
  const save = (value) =>
    db.app_settings.upsert({
      where: { key },
      create: { key, value },
      update: { value, updated_at: new Date() },
    });
  return {
    isBusy: () => busy,
    async status() {
      return (await db.app_settings.findUnique({ where: { key } }))?.value || { status: 'IDLE' };
    },
    async recover() {
      const state = (await db.app_settings.findUnique({ where: { key } }))?.value;
      if (state?.status === 'RUNNING')
        await save({
          ...state,
          status: 'FAILED',
          error: 'Interrupted by server restart; completed source runs are retained.',
        });
    },
    async start(pages) {
      if (busy) throw new AIError('AI_BUSY', 'Research backfill is already running.');
      busy = true;
      let source;
      const state = {
        status: 'RUNNING',
        pages,
        page: 0,
        startedAt: new Date().toISOString(),
        runIds: [],
        inserted: 0,
        skipped: 0,
        failed: 0,
      };
      try {
        source = await db.sources.findUnique({ where: { id: sourceDefinitions[2].id } });
        if (!source?.is_enabled)
          throw new AIError('SOURCE_DISABLED', 'Enable the arXiv source before backfill.');
        await save(state);
      } catch (error) {
        busy = false;
        throw error;
      }
      void (async () => {
        try {
          for (let page = 0; page < pages; page++) {
            const run = await ingest(db, { ...source, endpoint_url: researchPageURL(page * 50) });
            state.page = page + 1;
            state.runIds.push(run.id);
            state.inserted += run.inserted_count;
            state.skipped += run.skipped_count;
            state.failed += run.failed_count;
            await save(state);
            automation.wake();
            if (run.status === 'FAILED') throw Error('Source run failed');
          }
          state.status = 'COMPLETED';
          state.endedAt = new Date().toISOString();
          await save(state);
        } catch {
          state.status = 'FAILED';
          state.error = 'Backfill interrupted or upstream failed; inspect retained ingestion runs.';
          await save(state).catch(() =>
            logger.error(JSON.stringify({ event: 'backfill_status_unavailable' })),
          );
        } finally {
          busy = false;
        }
      })();
      return state;
    },
  };
}

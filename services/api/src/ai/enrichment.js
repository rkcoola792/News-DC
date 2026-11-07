import { AIError } from './limits.js';
import {
  enrichmentInput,
  enrichmentHash,
  enrichmentVersion,
  enrichmentEligibility,
  hasCurrentEnrichment,
  clearedEnrichment,
} from './enrichment-input.js';
import { enrichmentTask, validateEnrichment } from './enrichment-contract.js';
import { classifyTopics } from '../ingestion/normalize.js';

const include = { publishers: true };
export function createEnrichment(db, providers, logger = console) {
  let busy = false;
  async function process(job) {
    const id = job.content_id;
    try {
      const claim = await db.$transaction(
        async (tx) => {
          const row = await tx.content_items.findUniqueOrThrow({ where: { id }, include });
          if (hasCurrentEnrichment(row)) {
            await tx.content_processing_logs.update({
              where: { id: job.id },
              data: {
                status: 'SKIPPED',
                ended_at: new Date(),
                error_summary: 'CACHED: current enrichment reused',
              },
            });
            return null;
          }
          const reason = enrichmentEligibility(row);
          if (reason) {
            const { aiEnrichment, aiProcessingId, ...metadata } = row.metadata;
            await tx.content_items.update({
              where: { id },
              data: {
                ...clearedEnrichment,
                ai_status: 'SKIPPED',
                metadata: { ...metadata, aiEnabled: false, aiSkipReason: reason },
              },
            });
            await tx.content_processing_logs.update({
              where: { id: job.id },
              data: { status: 'SKIPPED', ended_at: new Date(), error_summary: reason },
            });
            return null;
          }
          const claimed = await tx.content_items.updateMany({
            where: { id, ai_status: { not: 'PROCESSING' } },
            data: {
              ai_status: 'PROCESSING',
              metadata: { ...row.metadata, aiProcessingId: job.id },
            },
          });
          if (!claimed.count) {
            await tx.content_processing_logs.update({
              where: { id: job.id },
              data: {
                status: 'SKIPPED',
                ended_at: new Date(),
                error_summary: 'Another worker is processing this record',
              },
            });
            return null;
          }
          await tx.content_processing_logs.update({
            where: { id: job.id },
            data: { status: 'PROCESSING' },
          });
          return row;
        },
        { isolationLevel: 'Serializable' },
      );
      if (!claim) return;
      const input = enrichmentInput(claim),
        inputHash = enrichmentHash(claim);
      const result = await providers.generate(enrichmentTask(input));
      // Validate again at the persistence boundary even with an injected provider transport.
      const value = validateEnrichment(result.value, input);
      await db.$transaction(
        async (tx) => {
          const fresh = await tx.content_items.findUniqueOrThrow({ where: { id }, include });
          if (fresh.metadata.aiProcessingId !== job.id) {
            await tx.content_processing_logs.update({
              where: { id: job.id },
              data: {
                status: 'SKIPPED',
                ended_at: new Date(),
                error_summary: 'Processing ownership changed; output discarded',
              },
            });
            return;
          }
          const { aiProcessingId, aiSkipReason, ...metadata } = fresh.metadata;
          if (enrichmentHash(fresh) !== inputHash) {
            await tx.content_items.update({
              where: { id },
              data: {
                ...clearedEnrichment,
                ai_status: 'PENDING',
                metadata: { ...metadata, aiEnabled: false },
              },
            });
            await tx.content_processing_logs.update({
              where: { id: job.id },
              data: {
                status: 'SKIPPED',
                ended_at: new Date(),
                error_summary: 'Source changed during processing; stale output discarded',
              },
            });
            return;
          }
          await tx.content_items.update({
            where: { id },
            data: {
              ai_status: 'COMPLETED',
              ai_summary: value.summary,
              key_insights: value.keyInsights.map((insight) => insight.text),
              intelligence_type: value.intelligenceType,
              is_data_center_relevant: value.isDataCenterRelevant,
              relevance_confidence: value.relevanceConfidence,
              relevance_score: value.relevanceScore,
              quality_score: value.qualityScore,
              ai_model: result.model,
              prompt_version: enrichmentVersion,
              ai_processed_at: new Date(),
              metadata: {
                ...metadata,
                topicMethod: 'ai-enrichment',
                aiEnabled: true,
                aiEnrichment: {
                  inputHash,
                  version: enrichmentVersion,
                  provider: result.provider,
                  model: result.model,
                  scope: input.scope,
                  hasSufficientEvidence: value.hasSufficientEvidence,
                  reason: value.reason,
                  qualityReason: value.qualityReason,
                  summaryEvidence: value.summaryEvidence,
                  insightEvidence: value.keyInsights.map((insight) => insight.quote),
                  attempts: result.attempts,
                  rubricVersion: 'newsdc-scores-v1',
                },
              },
            },
          });
          await tx.content_category_map.deleteMany({ where: { content_id: id } });
          if (value.categories.length)
            await tx.content_category_map.createMany({
              data: value.categories.map((category_slug) => ({ content_id: id, category_slug })),
            });
          await tx.content_processing_logs.update({
            where: { id: job.id },
            data: {
              status: 'COMPLETED',
              model: result.model,
              retry_count: Math.max(0, result.attempts.length - 1),
              ended_at: new Date(),
              error_summary: null,
            },
          });
        },
        { isolationLevel: 'Serializable' },
      );
    } catch (error) {
      const code = error instanceof AIError ? error.code : 'ENRICHMENT_FAILED';
      await db
        .$transaction(async (tx) => {
          await tx.content_items.updateMany({
            where: {
              id,
              ai_status: 'PROCESSING',
              metadata: { path: ['aiProcessingId'], equals: job.id },
            },
            data: { ai_status: 'FAILED' },
          });
          await tx.content_processing_logs.update({
            where: { id: job.id },
            data: {
              status: 'FAILED',
              ended_at: new Date(),
              error_summary: code,
              retry_count: Math.max(0, (error.attempts?.length || 1) - 1),
              model: error instanceof AIError ? error.model || null : null,
            },
          });
        })
        .catch(() => logger.error(JSON.stringify({ event: 'enrichment_status_unavailable' })));
    }
  }
  async function execute(jobs) {
    try {
      for (const job of jobs) await process(job);
    } finally {
      busy = false;
    }
  }
  async function start(ids, wait) {
    if (!providers.isEnabled())
      throw new AIError(
        'AI_DISABLED',
        'Enable AI_PROVIDER_ENABLED on the server before enrichment.',
      );
    if (busy) throw new AIError('AI_BUSY', 'An enrichment batch is already running.');
    busy = true;
    try {
      const rows = await db.content_items.findMany({
        where: { id: { in: ids } },
        select: { id: true },
      });
      if (rows.length !== ids.length) {
        const error = new AIError(
          'CONTENT_NOT_FOUND',
          'One or more selected content records do not exist.',
        );
        error.status = 404;
        throw error;
      }
      const jobs = await db.$transaction(async (tx) => {
        const jobs = [];
        for (const content_id of ids)
          jobs.push(
            await tx.content_processing_logs.create({
              data: { content_id, status: 'PENDING', prompt_version: enrichmentVersion },
            }),
          );
        return jobs;
      });
      const completion = execute(jobs);
      if (wait) await completion;
      else
        void completion.catch(() =>
          logger.error(JSON.stringify({ event: 'enrichment_batch_failed' })),
        );
      return jobs.map((job) => job.id);
    } catch (error) {
      busy = false;
      throw error;
    }
  }
  return {
    isBusy: () => busy,
    enqueue: (ids) => start(ids, false),
    run: (ids) => start(ids, true),
    async status() {
      const [rows, logs] = await Promise.all([
        db.content_items.findMany({
          take: 50,
          orderBy: [{ published_at: { sort: 'desc', nulls: 'last' } }, { id: 'asc' }],
          include,
        }),
        db.content_processing_logs.findMany({
          take: 30,
          orderBy: [{ started_at: 'desc' }, { id: 'asc' }],
          include: { content_items: { select: { id: true, title: true } } },
        }),
      ]);
      return {
        enabled: providers.isEnabled(),
        busy,
        candidates: rows.map((row) => ({
          id: row.id,
          title: row.title,
          contentType: row.content_type,
          status: row.ai_status,
          skipReason: enrichmentEligibility(row),
          cached: hasCurrentEnrichment(row),
        })),
        logs,
      };
    },
  };
}

export async function recoverEnrichment(db) {
  await db.$transaction(async (tx) => {
    await tx.content_items.updateMany({
      where: { ai_status: 'PROCESSING' },
      data: { ai_status: 'FAILED' },
    });
    await tx.content_processing_logs.updateMany({
      where: { status: { in: ['PENDING', 'PROCESSING'] } },
      data: {
        status: 'FAILED',
        ended_at: new Date(),
        error_summary: 'Interrupted by previous server shutdown',
      },
    });
    const stale = await tx.content_items.findMany({
      where: {
        ai_status: 'COMPLETED',
        OR: [{ prompt_version: { not: enrichmentVersion } }, { prompt_version: null }],
      },
    });
    for (const row of stale) {
      const { aiEnrichment, aiProcessingId, aiSkipReason, ...metadata } = row.metadata;
      await tx.content_items.update({
        where: { id: row.id },
        data: {
          ...clearedEnrichment,
          ai_status: 'PENDING',
          metadata: { ...metadata, aiEnabled: false, topicMethod: 'metadata-keywords' },
        },
      });
      await tx.content_category_map.deleteMany({ where: { content_id: row.id } });
      const topics = classifyTopics(row.title, row.description || '');
      if (topics.length)
        await tx.content_category_map.createMany({
          data: topics.map((category_slug) => ({ content_id: row.id, category_slug })),
        });
    }
  });
}

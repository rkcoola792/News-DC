import { createHash } from 'node:crypto';
import { cleanText } from '../ingestion/normalize.js';

export const enrichmentVersion = 'newsdc-enrichment-v2';
export function enrichmentInput(row) {
  const text = cleanText(row.content_text || row.description || '', 6000);
  const scope =
    row.content_type === 'RESEARCH' && !row.content_text
      ? 'abstract-only'
      : row.content_type === 'VIDEO'
        ? row.metadata?.transcriptPermitted === true
          ? 'permitted-transcript'
          : 'video-metadata-only'
        : row.content_text
          ? 'provided-text'
          : 'source-description';
  return {
    title: cleanText(row.title, 1000),
    contentType: row.content_type,
    text,
    scope,
    publisher: row.publishers?.domain || null,
    publishedAt: row.published_at ? new Date(row.published_at).toISOString() : null,
  };
}
export function enrichmentHash(row) {
  return createHash('sha256')
    .update(JSON.stringify({ version: enrichmentVersion, input: enrichmentInput(row) }))
    .digest('hex');
}
export function enrichmentEligibility(row) {
  if (
    row.content_type === 'VIDEO' &&
    (!row.content_text || row.metadata?.transcriptPermitted !== true)
  )
    return 'A permitted transcript is required for video content enrichment.';
  const { text } = enrichmentInput(row);
  if (text.length < 160 || text.split(/\s+/).length < 25)
    return 'Source text is too thin for a grounded summary (at least 25 words and 160 characters required).';
  return null;
}
export function hasCurrentEnrichment(row) {
  return (
    row.ai_status === 'COMPLETED' &&
    row.prompt_version === enrichmentVersion &&
    row.metadata?.aiEnrichment?.inputHash === enrichmentHash(row)
  );
}
export const clearedEnrichment = {
  ai_summary: null,
  key_insights: [],
  intelligence_type: null,
  is_data_center_relevant: null,
  relevance_confidence: null,
  relevance_score: null,
  quality_score: null,
  ai_model: null,
  prompt_version: null,
  ai_processed_at: null,
};

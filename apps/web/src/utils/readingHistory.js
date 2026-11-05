export const HISTORY_KEY = 'newsdc-history';
export const HISTORY_LIMIT = 200;

export function normalizeHistory(value) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  return value
    .filter((entry) => {
      if (
        !entry ||
        typeof entry.contentId !== 'string' ||
        !entry.contentId.trim() ||
        typeof entry.openedAt !== 'string' ||
        !Number.isFinite(Date.parse(entry.openedAt)) ||
        seen.has(entry.contentId)
      )
        return false;
      seen.add(entry.contentId);
      return true;
    })
    .map(({ contentId, openedAt }) => ({ contentId, openedAt }))
    .slice(0, HISTORY_LIMIT);
}

export function recordOpening(history, contentId, openedAt = new Date().toISOString()) {
  return normalizeHistory([
    { contentId, openedAt },
    ...normalizeHistory(history).filter((entry) => entry.contentId !== contentId),
  ]);
}

export function loadHistory(storage) {
  try {
    return normalizeHistory(JSON.parse(storage.getItem(HISTORY_KEY)));
  } catch {
    return [];
  }
}

export function saveHistory(storage, history) {
  try {
    storage.setItem(HISTORY_KEY, JSON.stringify(normalizeHistory(history)));
    return true;
  } catch {
    return false;
  }
}

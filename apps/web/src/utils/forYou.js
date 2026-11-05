import { topicOptions } from '../data/taxonomy.js';
import { normalizePreferences } from './preferences.js';
import { normalizeHistory } from './readingHistory.js';

// Preview-only rule. These points express preferences, not content quality.
export function rankForYou(items, preferences, history = []) {
  const selected = normalizePreferences(preferences);
  const readIds = new Set(normalizeHistory(history).map((entry) => entry.contentId));
  return items
    .map((item, index) => {
      const topicId = topicOptions.find((topic) => topic.feedLabel === item.topic)?.id;
      const topicMatch = selected.topics.includes(topicId);
      const typeMatch = selected.contentTypes.includes(item.type.toUpperCase());
      return {
        item,
        index,
        preferencePoints: Number(topicMatch) * 2 + Number(typeMatch),
        read: readIds.has(item.id),
      };
    })
    .sort(
      (a, b) =>
        b.preferencePoints - a.preferencePoints ||
        Number(a.read) - Number(b.read) ||
        a.index - b.index,
    )
    .map((entry) => entry.item);
}

export function selectFeedItems(
  items,
  {
    path = '/',
    type = 'All',
    topic = '',
    query = '',
    saved = [],
    sort = '',
    preferences,
    history = [],
  } = {},
) {
  let results = items.filter(
    (item) =>
      (type === 'All' || item.type === type.replace(/s$/, '') || item.type === type) &&
      (!topic || item.topic === topic) &&
      (!query ||
        `${item.title} ${item.summary} ${item.topic}`
          .toLowerCase()
          .includes(query.toLowerCase())) &&
      (path !== '/saved' || saved.includes(item.id)),
  );
  if (sort === 'title') return results.sort((a, b) => a.title.localeCompare(b.title));
  return path === '/' ? rankForYou(results, preferences, history) : results;
}

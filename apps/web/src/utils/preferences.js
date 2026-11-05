import { topicOptions, contentTypeOptions } from '../data/taxonomy.js';
export const PREFERENCES_KEY = 'newsdc-preferences';
export function normalizePreferences(value) {
  const pick = (values, options) =>
    Array.isArray(values)
      ? options.filter((option) => values.includes(option.id)).map((option) => option.id)
      : [];
  return {
    topics: pick(value?.topics, topicOptions),
    contentTypes: pick(value?.contentTypes, contentTypeOptions),
  };
}
export function loadPreferences(storage) {
  try {
    return normalizePreferences(JSON.parse(storage.getItem(PREFERENCES_KEY)));
  } catch {
    return normalizePreferences(null);
  }
}
export function savePreferences(storage, value) {
  const preferences = normalizePreferences(value);
  try {
    storage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
    return { ok: true, preferences };
  } catch {
    return { ok: false, preferences };
  }
}
export function togglePreference(draft, group, id) {
  const current = normalizePreferences(draft);
  if (group !== 'topics' && group !== 'contentTypes') return current;
  return normalizePreferences({
    ...current,
    [group]: current[group].includes(id)
      ? current[group].filter((value) => value !== id)
      : [...current[group], id],
  });
}

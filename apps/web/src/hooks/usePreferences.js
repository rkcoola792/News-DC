import { useState } from 'react';
import { loadPreferences, savePreferences } from '../utils/preferences.js';
const storage = {
  getItem: (key) => window.localStorage.getItem(key),
  setItem: (key, value) => window.localStorage.setItem(key, value),
};
export function usePreferences() {
  const [preferences, setPreferences] = useState(() => loadPreferences(storage));
  function commitPreferences(draft) {
    const result = savePreferences(storage, draft);
    if (result.ok) setPreferences(result.preferences);
    return result.ok;
  }
  return { preferences, commitPreferences };
}

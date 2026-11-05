import { useEffect, useRef, useState } from 'react';
import { loadHistory, recordOpening, saveHistory } from '../utils/readingHistory.js';

const browserStorage = {
  getItem: (key) => window.localStorage.getItem(key),
  setItem: (key, value) => window.localStorage.setItem(key, value),
};

export function useReadingHistory(contentId) {
  const [history, setHistory] = useState(() => loadHistory(browserStorage));
  const [storageError, setStorageError] = useState(false);
  const current = useRef(history);
  const lastOpened = useRef(null);

  useEffect(() => {
    if (!contentId) {
      lastOpened.current = null;
      return;
    }
    if (lastOpened.current === contentId) return;
    lastOpened.current = contentId;
    const next = recordOpening(current.current, contentId);
    current.current = next;
    setHistory(next);
    setStorageError(!saveHistory(browserStorage, next));
  }, [contentId]);

  function clearHistory() {
    current.current = [];
    setHistory([]);
    setStorageError(!saveHistory(browserStorage, []));
  }

  return { history, clearHistory, storageError };
}

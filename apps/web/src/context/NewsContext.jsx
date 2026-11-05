import { usePreferences } from '../hooks/usePreferences.js';
import { createContext, useContext, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import BookmarkButton from '../components/content/BookmarkButton.jsx';
import { useReadingHistory } from '../hooks/useReadingHistory.js';
import { items } from '../data/preview.js';
import { loadBookmarks, saveBookmarks } from '../utils/bookmarks.js';
const bookmarkStorage = {
  getItem: (key) => window.localStorage.getItem(key),
  setItem: (key, value) => window.localStorage.setItem(key, value),
};
const NewsContext = createContext(null);
function stored(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}
function persist(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}
export function NewsProvider({ children }) {
  const { preferences, commitPreferences } = usePreferences();
  const { pathname: path } = useLocation();
  const [params, setParams] = useSearchParams();
  const [saved, setSaved] = useState(() => loadBookmarks(bookmarkStorage)),
    [dark, setDark] = useState(() => stored('newsdc-dark', false) === true);
  const [bookmarkError, setBookmarkError] = useState('');
  const [question, setQuestion] = useState(''),
    [asked, setAsked] = useState('');
  const type = params.get('type') || 'All',
    topic = params.get('topic') || '',
    query = params.get('q') || '';
  const detail = path.startsWith('/content/')
    ? items.find((x) => x.id === path.split('/').pop())
    : null;
  const { history, clearHistory, storageError } = useReadingHistory(detail?.id);
  function filter(key, value) {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    setParams(next);
  }
  function toggle(id) {
    const next = saved.includes(id) ? saved.filter((x) => x !== id) : [...saved, id];
    if (saveBookmarks(bookmarkStorage, next)) {
      setSaved(next);
      setBookmarkError('');
    } else {
      setBookmarkError(
        'Your browser could not save this bookmark change. Your saved items are unchanged. Allow browser storage and try again.',
      );
    }
  }
  const save = (item) => (
    <BookmarkButton item={item} isSaved={saved.includes(item.id)} onToggle={toggle} />
  );
  const persistTheme = (value) => persist('newsdc-dark', value);
  return (
    <NewsContext.Provider
      value={{
        preferences,
        commitPreferences,
        saved,
        bookmarkError,
        dark,
        setDark,
        persistTheme,
        question,
        setQuestion,
        asked,
        setAsked,
        type,
        topic,
        query,
        params,
        filter,
        history,
        clearHistory,
        storageError,
        save,
      }}
    >
      <div className={`app ${dark ? 'dark' : ''}`}>{children}</div>
    </NewsContext.Provider>
  );
}
export function useNews() {
  return useContext(NewsContext);
}

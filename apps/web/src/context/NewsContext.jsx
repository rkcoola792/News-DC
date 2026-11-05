import { createContext, useContext, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import BookmarkButton from '../components/content/BookmarkButton.jsx';
import { useReadingHistory } from '../hooks/useReadingHistory.js';
import { items } from '../data/preview.js';
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
  const { pathname: path } = useLocation();
  const [params, setParams] = useSearchParams();
  const [saved, setSaved] = useState(() => stored('newsdc-saved', [])),
    [dark, setDark] = useState(() => stored('newsdc-dark', false));
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
    setSaved(next);
    persist('newsdc-saved', next);
  }
  const save = (item) => (
    <BookmarkButton item={item} isSaved={saved.includes(item.id)} onToggle={toggle} />
  );
  const persistTheme = (value) => persist('newsdc-dark', value);
  return (
    <NewsContext.Provider
      value={{
        saved,
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

import { Link } from 'react-router-dom';
import { Layers, Search, Moon, Sun, History } from 'lucide-react';

import { useNews } from '../../context/NewsContext.jsx';
export default function Header() {
  const { dark, setDark, persistTheme, query } = useNews();
  return (
    <header className="topbar">
      <Link className="mobile-brand" to="/">
        <Layers size={21} />
        NewsDC
      </Link>
      <form className="global-search" action="/search">
        <Search size={17} />
        <input
          key={query}
          name="q"
          defaultValue={query}
          aria-label="Search content"
          placeholder="Search topics, articles, videos…"
        />
        <kbd>↵</kbd>
      </form>
      <button
        className="mobile-theme icon-button"
        aria-label="Toggle color theme"
        onClick={() => {
          setDark(!dark);
          persistTheme(!dark);
        }}
      >
        {dark ? <Sun size={18} /> : <Moon size={18} />}
      </button>
      <Link className="history-link" to="/history" aria-label="Reading history">
        <History size={18} />
        <span>History</span>
      </Link>
      <span className="preview-indicator">Design preview</span>
    </header>
  );
}

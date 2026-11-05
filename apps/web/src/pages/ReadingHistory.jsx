import { Link } from 'react-router-dom';
import { History } from 'lucide-react';
import { useNews } from '../context/NewsContext.jsx';
import { items } from '../data/preview.js';
export default function ReadingHistory() {
  const { history, clearHistory, storageError, save } = useNews();
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Reading history</h1>
          <p className="description">
            Recently opened content, stored only in this browser. Up to 200 items.
          </p>
        </div>
        <button className="clear-history" disabled={!history.length} onClick={clearHistory}>
          Clear history
        </button>
      </div>
      {storageError && (
        <p className="notice" role="status">
          Browser storage is unavailable. Changes last only for this session.
        </p>
      )}
      {history.length ? (
        <div className="history-list">
          {history.map((entry) => {
            const item = items.find((x) => x.id === entry.contentId);
            return (
              <article className="history-row" key={entry.contentId}>
                <History size={18} />
                <div>
                  {item ? (
                    <Link className="headline" to={`/content/${item.id}`}>
                      {item.title}
                    </Link>
                  ) : (
                    <p>Content is no longer available</p>
                  )}
                  <time dateTime={entry.openedAt}>{new Date(entry.openedAt).toLocaleString()}</time>
                </div>
                {item && save(item)}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty">
          <History size={28} />
          <h2>No reading history yet</h2>
          <p>Open an item from Discover to start your history.</p>
          <Link className="primary" to="/">
            Explore Discover
          </Link>
        </div>
      )}
    </>
  );
}

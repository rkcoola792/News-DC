import { Link } from 'react-router-dom';
import { useNews } from '../context/NewsContext.jsx';
import { useResource } from '../hooks/useResource.js';
import { asItem, isContentId } from '../services/api.js';
import ResourceState from '../components/common/ResourceState.jsx';
export default function ReadingHistory() {
  const { history, clearHistory, storageError, save } = useNews();
  const ids = history
    .map((h) => h.contentId)
    .filter(isContentId)
    .slice(0, 200);
  const resource = useResource(
    ids.length ? `/content?limit=100&ids=${ids.slice(0, 100).join(',')}` : null,
  );
  const older = useResource(
    ids.length > 100 ? `/content?limit=100&ids=${ids.slice(100).join(',')}` : null,
  );
  const found = new Map(
    [...(resource.data?.data || []), ...(older.data?.data || [])].map((row) => [
      row.id,
      asItem(row),
    ]),
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Reading history</h1>
          <p className="description">The latest 200 opened items, stored in this browser.</p>
        </div>
        <button className="clear-history" disabled={!history.length} onClick={clearHistory}>
          Clear history
        </button>
      </div>
      {storageError && (
        <p className="notice" role="status">
          Storage is unavailable. Changes last only for this session.
        </p>
      )}
      <ResourceState {...resource} />
      {older.error && <ResourceState {...older} />}
      {!history.length && (
        <div className="empty">
          <h2>No reading history yet</h2>
          <p>Open something from Discover to start your history.</p>
          <Link className="primary" to="/">
            Explore Discover
          </Link>
        </div>
      )}
      {!resource.loading && !resource.error && (
        <div className="history-list">
          {history.map((entry) => {
            const item = found.get(entry.contentId);
            return (
              <article className="history-row" key={entry.contentId}>
                <div>
                  <Link className="headline" to={`/content/${entry.contentId}`}>
                    {item?.title || 'Open recorded item'}
                  </Link>
                  <time dateTime={entry.openedAt}>{new Date(entry.openedAt).toLocaleString()}</time>
                </div>
                {item && save(item)}
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}

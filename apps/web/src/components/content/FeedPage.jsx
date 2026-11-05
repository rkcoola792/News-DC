import { items } from '../../data/preview.js';
import { useNews } from '../../context/NewsContext.jsx';
import ContentFeed from './ContentFeed.jsx';
import ContentTypeTabs from './ContentTypeTabs.jsx';
import FeedFilters from './FeedFilters.jsx';
export default function FeedPage({ path }) {
  const { type, topic, query, saved, params, filter, save } = useNews();
  let results = items.filter(
    (x) =>
      (type === 'All' || x.type === type.replace(/s$/, '') || x.type === type) &&
      (!topic || x.topic === topic) &&
      (!query ||
        `${x.title} ${x.summary} ${x.topic}`.toLowerCase().includes(query.toLowerCase())) &&
      (path !== '/saved' || saved.includes(x.id)),
  );
  if (params.get('sort') === 'title')
    results = [...results].sort((a, b) => a.title.localeCompare(b.title));
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>
            {path === '/saved'
              ? 'Saved'
              : path === '/trending'
                ? 'Trending'
                : path === '/search'
                  ? query
                    ? `Search results for “${query}”`
                    : 'Search'
                  : 'Discover'}
          </h1>
          <p className="description">
            {path === '/saved'
              ? 'Your bookmarked articles, videos, and research.'
              : path === '/trending'
                ? 'Explore the conversations shaping data center infrastructure.'
                : path === '/search'
                  ? 'Find a clearer perspective across your content library.'
                  : 'The latest in data center intelligence.'}
          </p>
        </div>
        <span className="edition">YOUR DAILY PERSPECTIVE</span>
      </div>
      <ContentTypeTabs type={type} filter={filter} />
      <FeedFilters topic={topic} params={params} filter={filter} />
      {path === '/trending' && (
        <p className="notice">
          Preview order only. Live ranking will use freshness and available signals.
        </p>
      )}
      <ContentFeed
        results={results}
        isSaved={path === '/saved'}
        ranked={path === '/trending'}
        save={save}
      />
      <footer className="feed-footer">
        <span>{results.length} preview items</span>
        <span>
          {path === '/saved'
            ? 'Saved in this browser'
            : 'Illustrative content · Sources not connected'}
        </span>
      </footer>
    </>
  );
}

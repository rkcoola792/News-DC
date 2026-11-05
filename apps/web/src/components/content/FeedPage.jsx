import { selectFeedItems } from '../../utils/forYou.js';
import ForYouExplanation from './ForYouExplanation.jsx';
import { Link, useLocation } from 'react-router-dom';
import { items } from '../../data/preview.js';
import { useNews } from '../../context/NewsContext.jsx';
import ContentFeed from './ContentFeed.jsx';
import ContentTypeTabs from './ContentTypeTabs.jsx';
import FeedFilters from './FeedFilters.jsx';
export default function FeedPage({ path }) {
  const location = useLocation();
  const { type, topic, query, saved, params, filter, save, preferences, history } = useNews();
  const results = selectFeedItems(items, {
    path,
    type,
    topic,
    query,
    saved,
    sort: params.get('sort') || '',
    preferences,
    history,
  });
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
        {path === '/' ? (
          <Link className="personalize-link" to="/preferences">
            Personalize your feed
          </Link>
        ) : (
          <span className="edition">YOUR DAILY PERSPECTIVE</span>
        )}
      </div>
      {path === '/' && location.state?.preferencesSaved && (
        <p className="notice" role="status">
          Preferences saved in this browser. For You ordering now reflects your selections.
        </p>
      )}
      <ContentTypeTabs type={type} filter={filter} />
      <FeedFilters topic={topic} params={params} filter={filter} personalized={path === '/'} />
      {path === '/' && <ForYouExplanation alphabetical={params.get('sort') === 'title'} />}
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

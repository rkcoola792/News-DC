import { Link, useLocation } from 'react-router-dom';
import { useNews } from '../../context/NewsContext.jsx';
import { useResource } from '../../hooks/useResource.js';
import { asItem, apiBase, isContentId } from '../../services/api.js';
import ResourceState from '../common/ResourceState.jsx';
import ContentFeed from './ContentFeed.jsx';
import ContentTypeTabs from './ContentTypeTabs.jsx';
import FeedFilters from './FeedFilters.jsx';
export default function FeedPage({ path }) {
  const location = useLocation();
  const { type, topic, query, saved, params, filter, save, preferences, history } = useNews();
  const args = new URLSearchParams();
  args.set('page', params.get('page') || '1');
  args.set('limit', '10');
  const contentType = {
    Articles: 'ARTICLE',
    Videos: 'VIDEO',
    Research: 'RESEARCH',
    Discussions: 'DISCUSSION',
  }[type];
  if (contentType) args.set('type', contentType);
  if (topic) args.set('category', topic);
  if (query) args.set('q', query);
  for (const key of ['publisher', 'from', 'to', 'minQuality', 'minRelevance', 'sort', 'timeframe'])
    if (params.get(key)) args.set(key, params.get(key));
  if (params.get('sort') === 'title') args.set('order', 'asc');
  const savedIds = saved.filter(isContentId).slice(0, 200);
  if (path === '/saved') args.set('ids', savedIds.join(','));
  const personalized = path === '/' && !params.get('sort');
  if (personalized) {
    if (preferences.topics.length) args.set('topics', preferences.topics.join(','));
    if (preferences.contentTypes.length) args.set('types', preferences.contentTypes.join(','));
    if (history.length)
      args.set(
        'read',
        history
          .map((h) => h.contentId)
          .filter(isContentId)
          .join(','),
      );
  }
  const endpoint = personalized
    ? '/recommendations/for-you'
    : path === '/trending' && !params.get('sort')
      ? '/recommendations/trending'
      : path === '/search'
        ? '/search'
        : '/content';
  const resource = useResource(
    path === '/saved' && !savedIds.length ? null : `${endpoint}?${args}`,
  );
  const results = resource.data?.data.map(asItem) || [];
  const pagination = resource.data?.pagination || { total: 0, page: 1, totalPages: 0 };
  const title =
    path === '/saved'
      ? 'Saved'
      : path === '/trending'
        ? 'Trending'
        : path === '/search'
          ? query
            ? `Search results for “${query}”`
            : 'Search'
          : 'Discover';
  const exportArgs = new URLSearchParams(args);
  for (const key of ['topics', 'types', 'read', 'timeframe']) exportArgs.delete(key);
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>{title}</h1>
          <p className="description">
            {path === '/saved'
              ? 'Your reading list, saved in this browser.'
              : 'Data center intelligence from original publishers.'}
          </p>
        </div>
        {path === '/' && (
          <Link className="personalize-link" to="/preferences">
            Personalize your feed
          </Link>
        )}
      </div>
      {location.state?.preferencesSaved && (
        <p className="notice" role="status">
          Preferences saved in this browser.
        </p>
      )}
      <ContentTypeTabs type={type} filter={filter} />
      <FeedFilters topic={topic} params={params} filter={filter} personalized={path === '/'} />
      {path === '/' && (
        <details className="for-you-explanation">
          <summary>How For You is ordered</summary>
          <p>
            Selected topics and formats receive boosts. Previously opened items receive a small
            reduction. Publication date and available engagement break ties. These are deterministic
            rules; AI relevance and quality scores are not available yet.
          </p>
        </details>
      )}
      {path === '/trending' && (
        <>
          <p className="notice">
            Heuristic ranking uses freshness and available source engagement, not a claim of
            virality.
          </p>
          <label className="timeframe">
            Timeframe{' '}
            <select
              value={params.get('timeframe') || 'all'}
              onChange={(e) => filter('timeframe', e.target.value)}
            >
              <option value="all">All dates</option>
              <option value="24h">24 hours</option>
              <option value="7d">7 days</option>
              <option value="30d">30 days</option>
            </select>
          </label>
        </>
      )}
      <ResourceState {...resource} />
      {!resource.loading && !resource.error && (
        <ContentFeed
          results={results}
          isSaved={path === '/saved'}
          ranked={path === '/trending'}
          save={save}
        />
      )}
      <div className="pagination">
        <button
          disabled={pagination.page <= 1 || resource.loading}
          onClick={() => filter('page', String(pagination.page - 1))}
        >
          Previous
        </button>
        <span>
          Page {pagination.page} of {Math.max(1, pagination.totalPages)}
        </span>
        <button
          disabled={pagination.page >= pagination.totalPages || resource.loading}
          onClick={() => filter('page', String(pagination.page + 1))}
        >
          Next
        </button>
      </div>
      <footer className="feed-footer">
        <span>{pagination.total} results · AI processing disabled</span>
        <div>
          <Link to={path} onClick={() => {}}>
            Clear filters
          </Link>
          {!(path === '/saved' && !savedIds.length) && (
            <>
              <a href={`${apiBase()}/exports/content.json?${exportArgs}`}>JSON</a>
              <a href={`${apiBase()}/exports/content.md?${exportArgs}`}>Markdown</a>
            </>
          )}
        </div>
      </footer>
    </>
  );
}

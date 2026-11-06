import { topicOptions } from '../../data/taxonomy.js';
export default function FeedFilters({ topic, params, filter, personalized = false }) {
  return (
    <div className="feed-tools expanded-filters">
      <label>
        Topic
        <select value={topic} onChange={(e) => filter('topic', e.target.value)}>
          <option value="">All topics</option>
          {topicOptions.map((t) => (
            <option value={t.id} key={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Sort
        <select value={params.get('sort') || ''} onChange={(e) => filter('sort', e.target.value)}>
          <option value="">{personalized ? 'For You' : 'Default order'}</option>
          <option value="publishedAt">Newest</option>
          <option value="title">Title A–Z</option>
          <option value="quality">Quality (when available)</option>
          <option value="relevance">Relevance (when available)</option>
        </select>
      </label>
      <details className="more-filters">
        <summary>More filters</summary>
        <div>
          <label>
            Publisher
            <input
              value={params.get('publisher') || ''}
              placeholder="Name or domain"
              onChange={(e) => filter('publisher', e.target.value)}
            />
          </label>
          <label>
            From
            <input
              type="date"
              value={params.get('from') || ''}
              onChange={(e) => filter('from', e.target.value)}
            />
          </label>
          <label>
            To
            <input
              type="date"
              value={params.get('to') || ''}
              onChange={(e) => filter('to', e.target.value)}
            />
          </label>
          <label>
            Min. quality
            <input
              type="number"
              min="0"
              max="100"
              value={params.get('minQuality') || ''}
              onChange={(e) => filter('minQuality', e.target.value)}
            />
          </label>
          <label>
            Min. relevance
            <input
              type="number"
              min="0"
              max="100"
              value={params.get('minRelevance') || ''}
              onChange={(e) => filter('minRelevance', e.target.value)}
            />
          </label>
          <p>AI scores are not generated in this build. Score filters may return no results.</p>
        </div>
      </details>
    </div>
  );
}

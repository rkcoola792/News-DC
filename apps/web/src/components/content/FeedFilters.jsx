import { topics } from '../../data/preview.js';
export default function FeedFilters({ topic, params, filter, personalized = false }) {
  return (
    <div className="feed-tools">
      <label>
        Topic{' '}
        <select value={topic} onChange={(e) => filter('topic', e.target.value)}>
          <option value="">All topics</option>
          {topics.map(([name]) => (
            <option key={name}>{name}</option>
          ))}
        </select>
      </label>
      <label>
        Sort{' '}
        <select value={params.get('sort') || ''} onChange={(e) => filter('sort', e.target.value)}>
          <option value="">{personalized ? 'For You (preview)' : 'Preview order'}</option>
          <option value="title">Title A–Z</option>
        </select>
      </label>
    </div>
  );
}

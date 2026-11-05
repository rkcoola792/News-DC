import ContentCard from './ContentCard.jsx';
import EmptyState from '../common/EmptyState.jsx';
export default function ContentFeed({ results, isSaved, ranked, save }) {
  return (
    <div className="feed">
      {results.length ? (
        results.map((item, i) => (
          <ContentCard key={item.id} item={item} rank={ranked ? i + 1 : null} save={save} />
        ))
      ) : (
        <EmptyState
          title={isSaved ? 'Your reading list starts here' : 'No matching content'}
          description={
            isSaved
              ? 'Save something from Discover to find it here. Bookmarks stay in this browser.'
              : 'Try a different topic, content type, or search term.'
          }
        />
      )}
    </div>
  );
}

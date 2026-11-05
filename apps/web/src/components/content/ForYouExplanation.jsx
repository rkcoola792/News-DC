import { Link } from 'react-router-dom';
import { useNews } from '../../context/NewsContext.jsx';
export default function ForYouExplanation({ alphabetical }) {
  const { preferences } = useNews();
  const hasPreferences = preferences.topics.length > 0 || preferences.contentTypes.length > 0;
  return (
    <details className="for-you-explanation">
      <summary>
        {alphabetical
          ? 'Title sorting is active'
          : hasPreferences
            ? 'Ordered for your interests'
            : 'Discover something new'}
      </summary>
      <p>
        {alphabetical
          ? 'Title A–Z overrides personalization. Choose For You (preview) to restore your personalized order.'
          : 'Preferred topics receive a stronger boost than preferred formats. When matches are equal, unread items appear first. Other items remain available, and ties keep their original order.'}
      </p>
      <p>
        This preview uses browser-local preferences and reading history. Live relevance, quality,
        freshness, and engagement signals are not connected.
      </p>
      <Link to="/preferences">Manage preferences</Link>
    </details>
  );
}

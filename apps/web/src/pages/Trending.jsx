import FeedPage from '../components/content/FeedPage.jsx';
import TrendSummary from '../components/content/TrendSummary.jsx';
export default function Trending() {
  return (
    <FeedPage path="/trending">
      <TrendSummary />
    </FeedPage>
  );
}

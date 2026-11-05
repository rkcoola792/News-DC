import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { useNews } from '../context/NewsContext.jsx';
import { items } from '../data/preview.js';
import { useParams } from 'react-router-dom';
import EmptyState from '../components/common/EmptyState.jsx';
export default function ContentDetail() {
  const { save } = useNews();
  const { id } = useParams();
  const detail = items.find((item) => item.id === id);
  if (!detail)
    return (
      <EmptyState
        title="Content not found"
        description="This item is not available in the current library."
      />
    );
  return (
    <>
      <Link className="back" to="/">
        <ArrowLeft size={16} />
        Back to Discover
      </Link>
      <div className="detail-labels">
        <span>{detail.topic}</span>
        <span>{detail.type}</span>
      </div>
      <h1 className="detail-title">{detail.title}</h1>
      <div className="detail-meta">
        <span>Sample content · Publication not connected</span>
        {save(detail)}
      </div>
      <section className="ai-panel">
        <h2>
          <Sparkles size={19} />
          AI Summary
        </h2>
        <p>{detail.summary}</p>
        <small>Illustrative summary layout. AI enrichment is not connected.</small>
      </section>
      <section className="insights">
        <h2>Key insights</h2>
        <p>
          Verified insights, publisher attribution, and original source links will appear here once
          real content is connected.
        </p>
        <details>
          <summary>Relevance & quality</summary>
          <p>
            No scores are available for sample content. Scores and explanations will come from the
            processing pipeline.
          </p>
        </details>
      </section>
    </>
  );
}

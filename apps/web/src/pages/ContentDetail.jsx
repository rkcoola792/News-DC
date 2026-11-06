import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useNews } from '../context/NewsContext.jsx';
import { useResource } from '../hooks/useResource.js';
import { asItem, sourceUrl } from '../services/api.js';
import ResourceState from '../components/common/ResourceState.jsx';
import ContentFeed from '../components/content/ContentFeed.jsx';
export default function ContentDetail() {
  const { id } = useParams();
  const { save, setOpenedId } = useNews();
  const resource = useResource(`/content/${encodeURIComponent(id)}`),
    related = useResource(`/content/${encodeURIComponent(id)}/related`);
  useEffect(() => {
    if (resource.data?.data.id) setOpenedId(resource.data.data.id);
  }, [resource.data, setOpenedId]);
  if (resource.loading || resource.error) return <ResourceState {...resource} />;
  if (!resource.data) return null;
  const detail = asItem(resource.data.data),
    url = sourceUrl(detail.url);
  return (
    <>
      <Link className="back" to="/">
        <ArrowLeft size={16} />
        Back to Discover
      </Link>
      <div className="detail-labels">
        {detail.categories.map((t) => (
          <Link key={t.slug} to={`/?topic=${t.slug}`}>
            {t.name}
          </Link>
        ))}
        <span>{detail.type}</span>
      </div>
      <h1 className="detail-title">{detail.title}</h1>
      <div className="detail-meta">
        <span>
          {detail.publisher?.name || 'Unknown publisher'} ·{' '}
          {detail.publishedAt ? new Date(detail.publishedAt).toLocaleString() : 'Date unavailable'}
          {detail.author && ` · ${detail.author}`}
        </span>
        {save(detail)}
      </div>
      {detail.thumbnailUrl && sourceUrl(detail.thumbnailUrl) && (
        <img
          className="detail-image"
          src={detail.thumbnailUrl}
          alt=""
          referrerPolicy="no-referrer"
        />
      )}
      <section className="insights">
        <h2>Publisher description</h2>
        <p>{detail.description || 'No description was provided.'}</p>
        {detail.durationSeconds != null && (
          <p>
            Duration: {Math.floor(detail.durationSeconds / 60)}m {detail.durationSeconds % 60}s
          </p>
        )}
        {detail.metadata?.doi && <p>DOI: {String(detail.metadata.doi)}</p>}
        {url && (
          <a className="primary" href={url} target="_blank" rel="noopener noreferrer">
            {detail.type === 'Video' ? 'Watch original' : 'Read original'}
          </a>
        )}
      </section>
      <section className="ai-panel">
        <h2>AI enrichment is disabled</h2>
        <p>
          Summaries, key insights and AI scores are not generated in this build. The description
          above comes from source metadata.
        </p>
        <small>Topic labels use metadata keyword rules.</small>
      </section>
      <h2 className="section-title">Related content</h2>
      <ResourceState {...related} />
      {!related.loading && !related.error && (
        <ContentFeed results={related.data?.data.map(asItem) || []} save={save} />
      )}
    </>
  );
}

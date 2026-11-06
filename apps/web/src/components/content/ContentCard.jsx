import ContentThumbnail from './ContentThumbnail.jsx';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { sourceUrl } from '../../services/api.js';
export default function ContentCard({ item, rank, save }) {
  const original = sourceUrl(item.url);
  return (
    <article className="content-row">
      {rank && <span className="rank">{rank}</span>}
      <ContentThumbnail item={item} />
      <div className="content-copy">
        <div className="eyebrow">
          {item.topic}
          <span>
            ·{' '}
            {item.publishedAt
              ? new Date(item.publishedAt).toLocaleDateString()
              : 'Date unavailable'}
          </span>
        </div>
        <Link className="headline" to={`/content/${item.id}`}>
          {item.title}
        </Link>
        <p className="summary">{item.summary}</p>
        <div className="metadata">
          {item.type}
          <span>·</span>
          {item.publisher?.name || 'Unknown publisher'}
          {original && (
            <a href={original} target="_blank" rel="noopener noreferrer">
              Original <ArrowUpRight size={12} />
            </a>
          )}
        </div>
      </div>
      {save(item)}
    </article>
  );
}

import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
export default function ContentCard({ item: x, rank, save }) {
  return (
    <article className="content-row" key={x.id}>
      {rank && <span className="rank">{rank}</span>}
      <Link className={`thumbnail ${x.art}`} to={`/content/${x.id}`} aria-label={`Open ${x.title}`}>
        <span />
        {x.type === 'Video' && <Play size={23} fill="white" />}
      </Link>
      <div className="content-copy">
        <div className="eyebrow">
          {x.topic}
          <span>· Preview</span>
        </div>
        <Link className="headline" to={`/content/${x.id}`}>
          {x.title}
        </Link>
        <p className="summary">{x.summary}</p>
        <div className="metadata">
          {x.type}
          <span>·</span>Sample content
        </div>
      </div>
      {save(x)}
    </article>
  );
}

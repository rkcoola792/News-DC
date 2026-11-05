import { Link } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
export default function EmptyState({ title, description }) {
  return (
    <div className="empty">
      <Bookmark size={28} />
      <h2>{title}</h2>
      <p>{description}</p>
      <Link className="primary" to="/">
        Explore Discover
      </Link>
    </div>
  );
}

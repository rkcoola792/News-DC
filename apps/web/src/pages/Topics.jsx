import { Link } from 'react-router-dom';
import { LayoutGrid } from 'lucide-react';
import { useResource } from '../hooks/useResource.js';
import ResourceState from '../components/common/ResourceState.jsx';
export default function Topics() {
  const resource = useResource('/topics');
  return (
    <>
      <h1>Topics</h1>
      <p className="description">Explore data center themes. Counts reflect indexed metadata.</p>
      <ResourceState {...resource} />
      <div className="topic-grid">
        {resource.data?.data.map((t) => (
          <Link className="topic-card" key={t.slug} to={`/?topic=${encodeURIComponent(t.slug)}`}>
            <LayoutGrid size={26} />
            <h2>{t.name}</h2>
            <span>{t.count} items</span>
          </Link>
        ))}
      </div>
    </>
  );
}

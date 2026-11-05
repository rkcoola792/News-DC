import { Link } from 'react-router-dom';

import { topics } from '../data/preview.js';
export default function Topics() {
  return (
    <>
      <h1>Topics</h1>
      <p className="description">Explore content by key data center themes.</p>
      <div className="topic-grid">
        {topics.map(([name, Icon]) => (
          <Link className="topic-card" to={`/?topic=${encodeURIComponent(name)}`} key={name}>
            <Icon size={28} strokeWidth={1.5} />
            <h2>{name}</h2>
            <span>Explore topic →</span>
          </Link>
        ))}
      </div>
      <p className="footnote">Topic counts will appear when indexed content is available.</p>
    </>
  );
}

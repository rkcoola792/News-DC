import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { sourceUrl } from '../../services/api.js';
export default function ContentThumbnail({ item }) {
  const [loaded, setLoaded] = useState(false),
    [failed, setFailed] = useState(false);
  const url = sourceUrl(item.thumbnailUrl);
  if (!url || failed) return null;
  return (
    <Link
      hidden={!loaded}
      className="thumbnail actual-thumbnail"
      to={`/content/${item.id}`}
      aria-label={`Open ${item.title}`}
    >
      <img
        src={url}
        alt=""
        loading="eager"
        referrerPolicy="no-referrer"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
      />
      {item.type === 'Video' && <Play size={22} />}
    </Link>
  );
}

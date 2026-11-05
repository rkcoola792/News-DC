import { Bookmark } from 'lucide-react';
export default function BookmarkButton({ item, isSaved, onToggle }) {
  return (
    <button
      className="icon-button save"
      aria-label={`${isSaved ? 'Remove bookmark for' : 'Bookmark'} ${item.title}`}
      aria-pressed={isSaved}
      onClick={() => onToggle(item.id)}
    >
      <Bookmark size={18} fill={isSaved ? 'currentColor' : 'none'} />
    </button>
  );
}

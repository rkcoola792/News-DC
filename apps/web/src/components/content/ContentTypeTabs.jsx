export default function ContentTypeTabs({ type, filter }) {
  return (
    <div className="tabs" aria-label="Content type">
      {['All', 'Articles', 'Videos', 'Research', 'Discussions'].map((t) => (
        <button
          key={t}
          className={type === t ? 'selected' : ''}
          aria-pressed={type === t}
          onClick={() => filter('type', t === 'All' ? '' : t)}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

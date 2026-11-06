export default function ResourceState({ loading, error, retry }) {
  if (error)
    return (
      <div className="empty" role="alert">
        <h2>Could not load content</h2>
        <p>{error}</p>
        <button className="primary" onClick={retry}>
          Try again
        </button>
      </div>
    );
  if (loading)
    return (
      <div className="loading-state" role="status" aria-live="polite">
        Loading content…
        <div className="skeleton" />
        <div className="skeleton" />
        <div className="skeleton" />
      </div>
    );
  return null;
}

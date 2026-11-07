import { Link } from 'react-router-dom';
import { useResource } from '../../hooks/useResource.js';
export default function TrendSummary() {
  const resource = useResource('/trends'),
    data = resource.data?.data;
  if (resource.loading) return <p role="status">Loading indexed themes…</p>;
  if (resource.error)
    return (
      <p className="notice">Theme report unavailable. Ranked content is still available below.</p>
    );
  if (!data) return null;
  const themes = data.report?.themes || data.topics;
  return (
    <section className="trend-summary">
      <h2>Emerging themes in the collection</h2>
      <p className="footnote">
        Source publications in the past seven days compared with the previous seven. Indexed
        coverage affects these counts; they do not prove an industry-wide trend.
      </p>
      {!themes.length && <p>There is not enough indexed history to identify a rising theme yet.</p>}
      {themes.map((theme) => (
        <details key={theme.slug}>
          <summary>
            {theme.name} · {theme.currentCount} items ·{' '}
            {theme.previousCount
              ? `${theme.delta > 0 ? '+' : ''}${theme.delta} versus prior week`
              : 'new in this window'}
          </summary>
          {theme.summary && <p>AI synthesis: {theme.summary}</p>}
          <Link to={`/?topic=${theme.slug}`}>Explore topic</Link>
          <ul>
            {theme.sources.map((source) => (
              <li key={source.contentId}>
                <a href={source.url} target="_blank" rel="noopener noreferrer">
                  {source.title}
                </a>
              </li>
            ))}
          </ul>
        </details>
      ))}
      {data.report && (
        <small>
          Generated {new Date(data.report.generatedAt).toLocaleString()} by {data.report.provider},
          using indexed source excerpts.
        </small>
      )}
    </section>
  );
}

import { useEffect, useState } from 'react';
import { useResource } from '../../hooks/useResource.js';
import { request } from '../../services/api.js';
import ResourceState from '../common/ResourceState.jsx';

export default function EnrichmentControls({ adminKey }) {
  const resource = useResource('/admin/ai/enrichment', { adminKey });
  const [view, setView] = useState(null),
    [selected, setSelected] = useState([]),
    [sending, setSending] = useState(false),
    [message, setMessage] = useState('');
  useEffect(() => {
    if (resource.data?.data) setView(resource.data.data);
  }, [resource.data]);
  useEffect(() => {
    const timer = setInterval(() => resource.retry(), 5000);
    return () => clearInterval(timer);
  }, [adminKey]);
  async function enrich() {
    setSending(true);
    setMessage('');
    try {
      const result = await request('/admin/ai/enrichment', {
        adminKey,
        method: 'POST',
        body: { contentIds: selected },
      });
      setMessage(result.message);
      setSelected([]);
      resource.retry();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSending(false);
    }
  }
  return (
    <section className="operator-section">
      <h2>Content enrichment</h2>
      <p>
        Select up to 10 records for one reviewable batch. Current outputs are reused. Thin source
        text and videos without a permitted transcript are skipped. No generation runs when someone
        browses content.
      </p>
      {(!view || resource.error) && <ResourceState {...resource} />}
      {view && (
        <>
          <p>
            {view.busy ? 'Enrichment running' : 'Ready'} · {selected.length} selected
          </p>
          <ul className="enrichment-candidates">
            {view.candidates.map((item) => (
              <li key={item.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={selected.includes(item.id)}
                    disabled={
                      sending ||
                      view.busy ||
                      !!item.skipReason ||
                      item.status === 'PROCESSING' ||
                      (!selected.includes(item.id) && selected.length >= 10)
                    }
                    onChange={(event) =>
                      setSelected((ids) =>
                        event.target.checked
                          ? [...ids, item.id]
                          : ids.filter((id) => id !== item.id),
                      )
                    }
                  />
                  <span>
                    {item.title}
                    <small>
                      {item.contentType} · {item.status}
                      {item.cached ? ' · current output saved' : ''}
                      {item.skipReason ? ` · ${item.skipReason}` : ''}
                    </small>
                  </span>
                </label>
              </li>
            ))}
          </ul>
          <button
            className="primary"
            disabled={!view.enabled || view.busy || sending || !selected.length}
            onClick={enrich}
          >
            {sending ? 'Queuing…' : 'Enrich selected records'}
          </button>
          {!view.enabled && (
            <p>Enable AI_PROVIDER_ENABLED in server configuration to process records.</p>
          )}
          <details>
            <summary>Recent processing history</summary>
            <ul className="enrichment-candidates">
              {view.logs.map((log) => (
                <li key={log.id}>
                  <strong>{log.content_items.title}</strong>
                  <small>
                    {log.status} · {new Date(log.started_at).toLocaleString()}
                    {log.model ? ` · ${log.model}` : ''}
                    {log.error_summary ? ` · ${log.error_summary}` : ''}
                  </small>
                </li>
              ))}
            </ul>
          </details>
        </>
      )}
      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}
    </section>
  );
}

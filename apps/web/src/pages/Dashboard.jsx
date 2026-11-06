import { useEffect, useState } from 'react';
import { useResource } from '../hooks/useResource.js';
import { request } from '../services/api.js';
import ResourceState from '../components/common/ResourceState.jsx';
export default function Dashboard() {
  const [input, setInput] = useState(''),
    [key, setKey] = useState(''),
    [message, setMessage] = useState(''),
    [busy, setBusy] = useState(false),
    [sourceId, setSourceId] = useState(''),
    [payload, setPayload] = useState('');
  const metrics = useResource(key ? '/admin/metrics' : null, { adminKey: key }),
    sources = useResource(key ? '/admin/sources' : null, { adminKey: key });
  useEffect(() => {
    if (!key) return;
    const timer = setInterval(() => {
      metrics.retry();
      sources.retry();
    }, 15000);
    return () => clearInterval(timer);
  }, [key]);
  async function act(path, method = 'POST', body = {}) {
    setBusy(true);
    setMessage('');
    try {
      const result = await request(path, { adminKey: key, method, body });
      setMessage(result.message || 'Operation completed.');
      metrics.retry();
      sources.retry();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }
  const data = metrics.data;
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Dashboard</h1>
          <p className="description">Source ingestion, content inventory and processing status.</p>
        </div>
        {key && (
          <button
            className="clear-history"
            onClick={() => {
              setKey('');
              setInput('');
            }}
          >
            Lock dashboard
          </button>
        )}
      </div>
      {!key ? (
        <form
          className="operator-login"
          onSubmit={(e) => {
            e.preventDefault();
            setKey(input.trim());
            setInput('');
          }}
        >
          <label>
            Operator key
            <input
              type="password"
              autoComplete="off"
              required
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </label>
          <button className="primary">Unlock</button>
          <p className="footnote">
            Use ADMIN_API_KEY from your server configuration. The key stays in memory only.
          </p>
        </form>
      ) : (
        <>
          <ResourceState {...metrics} />
          {message && (
            <p className="notice" role="status">
              {message}
            </p>
          )}
          {metrics.error && (
            <button className="clear-history" onClick={() => setKey('')}>
              Use a different key
            </button>
          )}
          {data && (
            <>
              <div className="metrics">
                {[
                  ['Total content', data.total],
                  ...['ARTICLE', 'VIDEO', 'RESEARCH', 'DISCUSSION'].map((type) => [
                    type,
                    data.byType.find((r) => r.type === type)?.count || 0,
                  ]),
                ].map(([label, count]) => (
                  <div className="metric" key={label}>
                    <span>{label}</span>
                    <strong>{count}</strong>
                  </div>
                ))}
              </div>
              <div className="dashboard-panels">
                <section>
                  <h2>Indexed over the last 7 days</h2>
                  <div className="ingestion-chart">
                    {Array.from({ length: 7 }, (_, i) =>
                      new Date(Date.now() - (6 - i) * 86400000).toISOString().slice(0, 10),
                    ).map((day) => (
                      <div key={day}>
                        <span>{data.daily[day] || 0}</span>
                        <div
                          style={{
                            height: `${Math.max(2, ((data.daily[day] || 0) / Math.max(1, ...Object.values(data.daily))) * 120)}px`,
                          }}
                        />
                        <small>{day.slice(5)}</small>
                      </div>
                    ))}
                  </div>
                </section>
                <section>
                  <h2>Processing</h2>
                  <p>
                    AI enrichment <span>Disabled by request</span>
                  </p>
                  {data.processing.map((r) => (
                    <p key={r.status}>
                      {r.status}
                      <span>{r.count}</span>
                    </p>
                  ))}
                  <p>
                    Ingestion<span>{data.ingestionRunning ? 'Running' : 'Idle'}</span>
                  </p>
                  <button
                    className="primary"
                    disabled={busy || data.ingestionRunning}
                    onClick={() => act('/admin/ingestion/run')}
                  >
                    Run ingestion
                  </button>
                </section>
              </div>
              <section className="operator-section">
                <h2>Sources</h2>
                <ResourceState {...sources} />
                {sources.data?.data.map((source) => (
                  <div className="source-row" key={source.id}>
                    <div>
                      <strong>{source.name}</strong>
                      <p>
                        {source.source_type} · {source.ingestion_runs[0]?.status || 'Never run'} ·
                        Last fetch:{' '}
                        {source.last_fetched_at
                          ? new Date(source.last_fetched_at).toLocaleString()
                          : 'Never'}
                      </p>
                      {source.ingestion_runs[0]?.error_summary && (
                        <p>{source.ingestion_runs[0].error_summary}</p>
                      )}
                    </div>
                    <label>
                      <input
                        type="checkbox"
                        checked={source.is_enabled}
                        disabled={busy}
                        onChange={(e) =>
                          act(`/admin/sources/${source.id}`, 'PATCH', { enabled: e.target.checked })
                        }
                      />
                      Enabled
                    </label>
                  </div>
                ))}
              </section>
              <section className="operator-section">
                <h2>Recent ingestion runs</h2>
                {!data.runs.length && <p className="description">No runs yet.</p>}
                {data.runs.map((run) => (
                  <div className="source-row" key={run.id}>
                    <div>
                      <strong>{run.sources.name}</strong>
                      <p>
                        {new Date(run.started_at).toLocaleString()} · {run.status}
                      </p>
                      {run.error_summary && <p>{run.error_summary}</p>}
                    </div>
                    <span>
                      {run.inserted_count} new · {run.skipped_count} skipped · {run.failed_count}{' '}
                      failed
                    </span>
                  </div>
                ))}
              </section>
              <details className="operator-section">
                <summary>Import permitted content metadata</summary>
                <p className="description">
                  For video, research, articles or discussions you have permission to index. No
                  transcript or AI processing occurs. Up to 100 records.
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    try {
                      const items = JSON.parse(payload);
                      if (!Array.isArray(items)) throw Error('Expected a JSON array');
                      void act('/admin/content/import', 'POST', { sourceId, items });
                    } catch (error) {
                      setMessage(error.message);
                    }
                  }}
                >
                  <label>
                    Attributing source
                    <select required value={sourceId} onChange={(e) => setSourceId(e.target.value)}>
                      <option value="">Select a source</option>
                      {sources.data?.data.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Metadata JSON
                    <textarea
                      rows="8"
                      required
                      value={payload}
                      onChange={(e) => setPayload(e.target.value)}
                      placeholder='[{"title":"Title","url":"https://publisher.example/item","type":"RESEARCH","description":"Publisher abstract","tags":["cooling","research"],"metadata":{"doi":"..."}}]'
                    />
                  </label>
                  <button className="primary" disabled={busy}>
                    Import metadata
                  </button>
                </form>
              </details>
            </>
          )}
        </>
      )}
    </>
  );
}

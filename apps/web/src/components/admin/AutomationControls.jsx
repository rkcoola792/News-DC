import { useEffect, useState } from 'react';
import { useResource } from '../../hooks/useResource.js';
import { request } from '../../services/api.js';
export default function AutomationControls({ adminKey }) {
  const automatic = useResource('/admin/ai/automation', { adminKey }),
    backfill = useResource('/admin/ingestion/backfill', { adminKey });
  const [data, setData] = useState(null),
    [fill, setFill] = useState(null),
    [pages, setPages] = useState(10),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState('');
  useEffect(() => {
    if (automatic.data?.data) setData(automatic.data.data);
  }, [automatic.data]);
  useEffect(() => {
    if (backfill.data?.data) setFill(backfill.data.data);
  }, [backfill.data]);
  useEffect(() => {
    const timer = setInterval(() => {
      automatic.retry();
      backfill.retry();
    }, 5000);
    return () => clearInterval(timer);
  }, [adminKey]);
  async function act(path, method, body) {
    setBusy(true);
    setMessage('');
    try {
      const result = await request(path, { adminKey, method, body });
      setMessage(result.message || 'Processing settings updated.');
      automatic.retry();
      backfill.retry();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="operator-section">
      <h2>Automatic processing and coverage</h2>
      <p>
        New or changed records are processed in the background. Pausing takes effect after an
        in-flight provider request finishes.
      </p>
      {data && (
        <>
          <p>
            {data.enabled
              ? data.paused
                ? 'Paused'
                : 'Enabled'
              : 'Disabled in server configuration'}{' '}
            · {data.busy ? 'Working' : 'Idle'}
          </p>
          <p>{data.counts.map((row) => `${row.status}: ${row.count}`).join(' · ')}</p>
          <button
            className="primary"
            disabled={busy || !data.enabled}
            onClick={() => act('/admin/ai/automation', 'PATCH', { paused: !data.paused })}
          >
            {data.paused ? 'Resume automatic enrichment' : 'Pause automatic enrichment'}
          </button>
          {data.lastError && (
            <p role="alert">Last processing event: {data.lastError}. Inspect processing history.</p>
          )}
        </>
      )}
      <details>
        <summary>Research backfill and trend report</summary>
        <p>
          Fetch additional pages from the approved arXiv title query. Duplicate records are skipped;
          source request spacing is preserved. This adds real metadata, not fabricated demo records.
        </p>
        <label>
          Pages (50 papers each)
          <input
            type="number"
            min={1}
            max={12}
            value={pages}
            onChange={(event) => setPages(Number(event.target.value))}
          />
        </label>
        <button
          className="primary"
          disabled={
            busy ||
            fill?.status === 'RUNNING' ||
            !Number.isInteger(pages) ||
            pages < 1 ||
            pages > 12
          }
          onClick={() => act('/admin/ingestion/backfill', 'POST', { pages })}
        >
          Start research backfill
        </button>
        {fill && (
          <p>
            Backfill: {fill.status}
            {fill.pages
              ? ` · ${fill.page}/${fill.pages} pages · ${fill.inserted} inserted · ${fill.skipped} skipped · ${fill.failed} failed`
              : ''}
            {fill.error ? ` · ${fill.error}` : ''}
          </p>
        )}
        <button
          className="clear-history"
          disabled={busy || data?.busy}
          onClick={() => act('/admin/ai/trends/refresh', 'POST', {})}
        >
          Refresh emerging-theme report
        </button>
      </details>
      {(automatic.error || backfill.error) && (
        <p role="alert">{automatic.error || backfill.error}</p>
      )}
      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}
    </section>
  );
}

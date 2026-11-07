import { useEffect, useState } from 'react';
import { useResource } from '../../hooks/useResource.js';
import { request } from '../../services/api.js';
import ResourceState from '../common/ResourceState.jsx';

export default function AIProviderControls({ adminKey }) {
  const status = useResource('/admin/ai/providers', { adminKey });
  useEffect(() => {
    const timer = setInterval(() => status.retry(), 15000);
    return () => clearInterval(timer);
  }, [adminKey]);
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState('');
  async function check() {
    setBusy(true);
    setMessage('');
    try {
      const result = await request('/admin/ai/providers/check', {
        adminKey,
        method: 'POST',
        body: {},
      });
      setMessage(
        `Connected through ${result.data.provider}${result.data.fallbackUsed ? ' (fallback)' : ''}. ${result.data.attempts.length} attempt(s).`,
      );
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
      status.retry();
    }
  }
  const data = status.data?.data;
  return (
    <section className="operator-section">
      <h2>AI provider connections</h2>
      <p>
        Gemini is primary, with two retries for temporary failures, then one OpenAI fallback
        attempt. Safety refusals are not retried through another provider.
      </p>
      <p>
        This verifies the provider connection only. Use Content enrichment to process selected
        records; the assistant is a separate feature.
      </p>
      <ResourceState {...status} />
      {data && (
        <>
          <p>
            Gemini: {data.geminiConfigured ? 'Configured' : 'Missing key'} · {data.geminiModel}
          </p>
          <p>
            OpenAI fallback: {data.openaiConfigured ? 'Configured' : 'Missing key'} ·{' '}
            {data.openaiModel}
          </p>
          <p>
            OpenAI estimated usage including unresolved requests: $
            {data.openaiUsedOrReservedUsd.toFixed(4)}. Requests today: {data.requestsToday}.
          </p>
          <button
            className="primary"
            disabled={busy || !data.enabled || !data.geminiConfigured}
            onClick={check}
          >
            {busy ? 'Checking connection…' : 'Check provider connection'}
          </button>
          {!data.enabled && <p>Provider checks are disabled on the server.</p>}
          <p>
            No application spending or daily request cap is configured. OpenAI fallback is billed by
            the provider. Usage history persists across restarts; provider quotas and retry
            safeguards still apply.
          </p>
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

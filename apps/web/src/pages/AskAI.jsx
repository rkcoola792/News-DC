import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Send } from 'lucide-react';
import { topicOptions } from '@newsdc/shared/taxonomy';
import { request } from '../services/api.js';
import { useResource } from '../hooks/useResource.js';
import ResourceState from '../components/common/ResourceState.jsx';
const suggestions = [
  'What are the latest developments in AI data center infrastructure?',
  'Which hyperscalers are investing in new data centers?',
  'What is emerging in liquid cooling and power availability?',
  'Which articles discuss GPU utilization optimization?',
  'What technologies could improve PUE and WUE?',
];
export default function AskAI() {
  const status = useResource('/assistant/status'),
    controller = useRef(null);
  const [question, setQuestion] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [history, setHistory] = useState([]),
    [type, setType] = useState(''),
    [topic, setTopic] = useState(''),
    [dateFrom, setDateFrom] = useState(''),
    [dateTo, setDateTo] = useState('');
  useEffect(() => () => controller.current?.abort(), []);
  async function ask(text = question) {
    if (busy || !text.trim() || status.data?.enabled === false) return;
    setQuestion(text);
    setBusy(true);
    setError('');
    controller.current = new AbortController();
    const filters = {
      ...(type ? { contentTypes: [type] } : {}),
      ...(topic ? { categorySlugs: [topic] } : {}),
      ...(dateFrom ? { dateFrom } : {}),
      ...(dateTo ? { dateTo } : {}),
    };
    try {
      const answer = await request('/assistant/ask', {
        method: 'POST',
        body: { question: text.trim(), filters },
        signal: controller.current.signal,
      });
      setHistory((items) => [...items.slice(-4), { question: text, answer }]);
      setQuestion('');
    } catch (err) {
      if (err.name !== 'AbortError') setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className={`assistant ${history.length ? 'has-conversation' : ''}`}>
      <div className="assistant-intro">
        <div className="sparkle-mark">
          <Sparkles size={30} />
        </div>
        <h1>Ask NewsDC AI</h1>
        <p>Answers from indexed data center sources, with links to supporting evidence.</p>
      </div>
      <ResourceState {...status} />
      {status.data?.enabled === false && (
        <p className="notice">
          The assistant is disabled on the server. You can still search indexed content.
        </p>
      )}
      {!history.length && (
        <div className="suggestions">
          {suggestions.map((text) => (
            <button
              key={text}
              className="type-tab"
              disabled={busy || !status.data?.enabled}
              onClick={() => ask(text)}
            >
              {text}
            </button>
          ))}
        </div>
      )}
      <details className="assistant-filters">
        <summary>Filter the evidence</summary>
        <div className="assistant-filter-fields">
          <label>
            Content type
            <select value={type} onChange={(event) => setType(event.target.value)}>
              <option value="">All types</option>
              {['ARTICLE', 'RESEARCH', 'VIDEO', 'DISCUSSION'].map((value) => (
                <option key={value} value={value}>
                  {value.toLowerCase()}
                </option>
              ))}
            </select>
          </label>
          <label>
            Topic
            <select value={topic} onChange={(event) => setTopic(event.target.value)}>
              <option value="">All topics</option>
              {topicOptions.map((value) => (
                <option key={value.id} value={value.id}>
                  {value.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            From
            <input
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
            />
          </label>
          <label>
            To
            <input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
          </label>
        </div>
      </details>
      <div aria-live="polite">
        {history.map(({ question: asked, answer }, index) => (
          <article className="answer" key={index}>
            <h2 className="assistant-question">{asked}</h2>
            {answer.insufficientEvidence ? (
              <p>{answer.answer}</p>
            ) : (
              answer.paragraphs.map((paragraph, paragraphIndex) => (
                <p key={paragraphIndex}>
                  {paragraph.text}
                  {paragraph.contentIds.map((id) => {
                    const source = answer.sources.find((source) => source.contentId === id);
                    return source ? (
                      <a
                        className="citation"
                        key={id}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={source.title}
                      >
                        {' '}
                        [{answer.sources.indexOf(source) + 1}]
                      </a>
                    ) : null;
                  })}
                </p>
              ))
            )}
            {answer.limitations && <p className="footnote">{answer.limitations}</p>}
            {answer.sources.length > 0 && (
              <div className="assistant-sources">
                <h3>Supporting sources</h3>
                {answer.sources.map((source, sourceIndex) => (
                  <div key={source.contentId}>
                    <Link to={`/content/${source.contentId}`}>
                      [{sourceIndex + 1}] {source.title}
                    </Link>
                    <small>
                      {source.publisher} ·{' '}
                      {source.publishedAt
                        ? new Date(source.publishedAt).toLocaleDateString()
                        : 'Date unavailable'}{' '}
                      · {source.scope}
                    </small>
                    <a href={source.url} target="_blank" rel="noopener noreferrer">
                      Open original
                    </a>
                  </div>
                ))}
              </div>
            )}
            <small>
              {answer.cached ? 'Reused saved answer. ' : ''}
              {answer.provider ? `Generated by ${answer.provider}. ` : ''}Retrieved{' '}
              {answer.retrieval.count} indexed sources.
            </small>
          </article>
        ))}
      </div>
      {busy && (
        <p className="notice" role="status">
          Searching indexed evidence and preparing a cited answer…
        </p>
      )}
      {error && (
        <p className="notice" role="alert">
          {error} Your question is kept so you can retry.
        </p>
      )}
      <form
        className="composer"
        onSubmit={(event) => {
          event.preventDefault();
          ask();
        }}
      >
        <input
          aria-label="Ask a question about data centers"
          placeholder="Ask a question about data centers…"
          maxLength={500}
          minLength={3}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          disabled={busy || !status.data?.enabled}
        />
        <button
          aria-label="Send question"
          disabled={busy || !status.data?.enabled || question.trim().length < 3}
        >
          <Send size={19} />
        </button>
      </form>
      <p className="assistant-note">
        Answers use collected evidence, not a live web search. Source scope and coverage may be
        limited.
      </p>
      {history.length > 0 && (
        <button className="clear-history" disabled={busy} onClick={() => setHistory([])}>
          Clear conversation
        </button>
      )}
    </div>
  );
}

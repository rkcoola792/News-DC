import { Sparkles, Send } from 'lucide-react';
import { useNews } from '../context/NewsContext.jsx';

export default function AskAI() {
  const { question, setQuestion, asked, setAsked } = useNews();
  return (
    <div className="assistant">
      <div className="assistant-intro">
        <div className="sparkle-mark">
          <Sparkles size={30} />
        </div>
        <h1>Ask NewsDC AI</h1>
        <p>Get answers and insights from indexed data center knowledge.</p>
        <div className="suggestions">
          {[
            'Latest in AI data centers?',
            'Trends in liquid cooling?',
            'Upcoming hyperscaler investments?',
            'How to improve data center efficiency?',
          ].map((prompt) => (
            <button key={prompt} onClick={() => setQuestion(prompt)}>
              {prompt}
            </button>
          ))}
        </div>
      </div>
      {asked && (
        <div className="answer" role="status">
          <strong>{asked}</strong>
          <p>
            Not enough indexed evidence. The assistant is not connected yet. Once content is
            indexed, answers will include linked sources.
          </p>
        </div>
      )}
      <form
        className="composer"
        onSubmit={(e) => {
          e.preventDefault();
          if (question.trim()) {
            setAsked(question.trim());
            setQuestion('');
          }
        }}
      >
        <input
          aria-label="Ask about data centers"
          placeholder="Ask a question about data centers…"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button className="icon-button" aria-label="Send question" disabled={!question.trim()}>
          <Send size={20} />
        </button>
      </form>
      <small className="assistant-note">Design preview · No AI model connected</small>
    </div>
  );
}

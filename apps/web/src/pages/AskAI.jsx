import { Sparkles } from 'lucide-react';
export default function AskAI() {
  return (
    <div className="assistant">
      <div className="assistant-intro">
        <div className="sparkle-mark">
          <Sparkles size={30} />
        </div>
        <h1>Ask NewsDC AI</h1>
        <p>AI features are intentionally disabled for this build.</p>
        <p className="description">
          You can search indexed publisher metadata, explore topics, and open original sources.
          Evidence-based answers and citations will be connected in the AI phase.
        </p>
      </div>
      <div className="composer">
        <input
          disabled
          aria-label="AI assistant disabled"
          placeholder="Available in the AI phase"
        />
      </div>
    </div>
  );
}

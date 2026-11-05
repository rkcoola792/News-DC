import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useNews } from '../context/NewsContext.jsx';
import { topicOptions, contentTypeOptions } from '../data/taxonomy.js';
import { normalizePreferences, togglePreference } from '../utils/preferences.js';
import PreferenceOptions from '../components/preferences/PreferenceOptions.jsx';
export default function Preferences() {
  const { preferences, commitPreferences } = useNews();
  const [draft, setDraft] = useState(() => normalizePreferences(preferences));
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dirty = JSON.stringify(draft) !== JSON.stringify(preferences);
  function toggle(group, id) {
    setDraft((current) => togglePreference(current, group, id));
    setError('');
  }
  function submit(event) {
    event.preventDefault();
    if (commitPreferences(draft)) navigate('/', { state: { preferencesSaved: true } });
    else
      setError(
        'Your browser could not save these preferences. Your previous preferences are unchanged. Allow browser storage and try again.',
      );
  }
  return (
    <div className="preferences-page">
      <Link className="back" to="/">
        <ArrowLeft size={16} />
        Back to Discover
      </Link>
      <h1>Personalize your feed</h1>
      <p className="description">
        Choose the topics and formats that interest you. Your preferences stay in this browser.
      </p>
      <p className="notice">
        Leave a group unselected to include everything. Preferences guide For You preview ordering;
        they do not change your current feed filters.
      </p>
      <form onSubmit={submit}>
        <PreferenceOptions
          legend="Your topics"
          description="Choose as many as you like."
          options={topicOptions}
          selected={draft.topics}
          onToggle={(id) => toggle('topics', id)}
        />
        <PreferenceOptions
          legend="Content formats"
          description="How do you like to explore?"
          options={contentTypeOptions}
          selected={draft.contentTypes}
          onToggle={(id) => toggle('contentTypes', id)}
        />
        {error && (
          <p className="preference-error" role="alert">
            {error}
          </p>
        )}
        <div className="preference-actions">
          <button
            className="clear-history"
            type="button"
            onClick={() => {
              setDraft(normalizePreferences(null));
              setError('');
            }}
          >
            Reset selections
          </button>
          <div>
            <Link className="cancel-preferences" to="/">
              Cancel
            </Link>
            <button className="primary" type="submit">
              Save preferences
            </button>
          </div>
        </div>
        <p className="footnote" role="status">
          {dirty ? 'You have unsaved changes.' : 'Your selections match your saved preferences.'}{' '}
          Reset clears selections in this form; save to apply.
        </p>
      </form>
    </div>
  );
}

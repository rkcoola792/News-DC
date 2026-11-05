export default function PreferenceOptions({ legend, description, options, selected, onToggle }) {
  return (
    <fieldset className="preference-section">
      <legend>{legend}</legend>
      <p className="description">{description}</p>
      <div className="preference-options">
        {options.map((option) => (
          <label
            className={`preference-option ${selected.includes(option.id) ? 'chosen' : ''}`}
            key={option.id}
          >
            <input
              type="checkbox"
              checked={selected.includes(option.id)}
              onChange={() => onToggle(option.id)}
            />
            <span>{option.name}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

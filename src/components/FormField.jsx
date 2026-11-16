import { useId } from 'react';

/** Label + input pair. Pass `children` to render a custom control (e.g. a select). */
function FormField({ label, id, children, hint, ...inputProps }) {
  const generatedId = useId();
  const fieldId = id || generatedId;
  return (
    <div className="field">
      <label htmlFor={fieldId} className="field__label">
        {label}
      </label>
      {children ? (
        children(fieldId)
      ) : (
        <input id={fieldId} className="field__input" {...inputProps} />
      )}
      {hint && <p className="field__hint">{hint}</p>}
    </div>
  );
}

export default FormField;

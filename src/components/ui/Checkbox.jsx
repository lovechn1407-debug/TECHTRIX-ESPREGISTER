import React from 'react';
import { Check } from 'lucide-react';

export function Checkbox({
  label,
  description,
  id,
  name,
  checked,
  onChange,
  disabled = false,
  className = '',
  ...props
}) {
  const checkboxId = id || name || `chk-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <label htmlFor={checkboxId} className={`checkbox-container ${className}`}>
      <input
        type="checkbox"
        id={checkboxId}
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="checkbox-input"
        {...props}
      />
      <div className="checkbox-custom" aria-hidden="true">
        {checked && <Check size={14} strokeWidth={3} />}
      </div>
      {(label || description) && (
        <div className="checkbox-label-block">
          {label && <div className="checkbox-label-text">{label}</div>}
          {description && <div className="checkbox-description">{description}</div>}
        </div>
      )}
    </label>
  );
}

export default Checkbox;

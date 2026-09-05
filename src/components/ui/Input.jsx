import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';

export function Input({
  label,
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder = ' ',
  error,
  mono = false,
  rightElement = null,
  disabled = false,
  readOnly = false,
  required = false,
  className = '',
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);
  const inputId = id || name || `input-${Math.random().toString(36).substr(2, 9)}`;
  const hasValue = value !== undefined && value !== null && String(value).length > 0;

  return (
    <div className={`input-group ${className}`}>
      <div className="input-wrapper">
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          placeholder={isFocused ? (placeholder || ' ') : ' '}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`input-field ${error ? 'input-error' : ''} ${mono ? 'input-mono' : ''} ${
            hasValue ? 'has-value' : ''
          }`}
          {...props}
        />
        {label && (
          <label htmlFor={inputId} className="floating-label">
            {label}
            {required && <span style={{ color: 'var(--danger)', marginLeft: '2px' }}>*</span>}
          </label>
        )}
        {rightElement && <div className="input-icon-right">{rightElement}</div>}
      </div>
      {error && (
        <div className="input-error-msg" role="alert">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

export default Input;

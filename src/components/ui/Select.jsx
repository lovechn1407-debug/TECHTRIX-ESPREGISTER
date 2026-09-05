import React from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';

export function Select({
  label,
  id,
  name,
  value,
  onChange,
  options = [],
  error,
  disabled = false,
  required = false,
  className = '',
  children,
  ...props
}) {
  const selectId = id || name || `select-${Math.random().toString(36).substr(2, 9)}`;
  const hasValue = value !== undefined && value !== null && String(value).length > 0;

  return (
    <div className={`input-group ${className}`}>
      <div className="select-wrapper">
        <select
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`select-field ${error ? 'input-error' : ''} ${hasValue ? 'has-value' : ''}`}
          {...props}
        >
          {/* Empty default option so floating label rests until selected */}
          <option value="" disabled hidden>
            {' '}
          </option>
          {options.length > 0
            ? options.map((opt) => {
                const optVal = typeof opt === 'object' ? opt.value : opt;
                const optLabel = typeof opt === 'object' ? opt.label : opt;
                return (
                  <option key={optVal} value={optVal}>
                    {optLabel}
                  </option>
                );
              })
            : children}
        </select>
        {label && (
          <label htmlFor={selectId} className="floating-label">
            {label}
            {required && <span style={{ color: 'var(--danger)', marginLeft: '2px' }}>*</span>}
          </label>
        )}
        <ChevronDown className="select-arrow" size={18} />
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

export default Select;

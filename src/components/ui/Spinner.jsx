import React from 'react';

export function Spinner({ size = 'md', color = 'primary', className = '' }) {
  const sizeClass = size === 'lg' ? 'spinner-lg' : '';
  const colorClass = color === 'primary' ? 'spinner-primary' : '';

  return <span className={`spinner ${sizeClass} ${colorClass} ${className}`} aria-hidden="true" />;
}

export default Spinner;

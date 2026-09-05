import React from 'react';
import Spinner from '../ui/Spinner';

export function Loading({ message = 'Loading...', fullPage = false }) {
  if (fullPage) {
    return (
      <div
        style={{
          minHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
        }}
      >
        <Spinner size="lg" color="primary" />
        <p style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.95rem' }}>
          {message}
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
      }}
    >
      <Spinner size="md" color="primary" />
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{message}</p>
    </div>
  );
}

export default Loading;

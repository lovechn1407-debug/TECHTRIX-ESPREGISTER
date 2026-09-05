import React from 'react';

export function PageWrapper({ children, className = '' }) {
  return (
    <div className={`page-wrapper animate-fade-in ${className}`} style={{ minHeight: 'calc(100vh - 144px)', display: 'flex', flexDirection: 'column' }}>
      {children}
    </div>
  );
}

export default PageWrapper;

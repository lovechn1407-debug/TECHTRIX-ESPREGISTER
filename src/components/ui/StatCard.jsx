import React, { useEffect, useState } from 'react';

export function StatCard({
  title,
  value = 0,
  icon: Icon,
  color = '#6C5CE7',
  bgColor = 'rgba(108, 92, 231, 0.1)',
  subtext,
}) {
  const [displayValue, setDisplayValue] = useState(0);

  // Animated counting number
  useEffect(() => {
    let start = 0;
    const end = parseInt(value, 10) || 0;
    if (end === 0) {
      setDisplayValue(0);
      return;
    }

    const duration = 600; // ms
    const stepTime = 20;
    const steps = Math.ceil(duration / stepTime);
    const increment = end / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="stat-card">
      <div className="stat-icon-box" style={{ background: bgColor, color }}>
        {Icon && <Icon size={26} strokeWidth={2.2} />}
      </div>
      <div className="stat-content">
        <div className="stat-value">{displayValue}</div>
        <div className="stat-label">{title}</div>
        {subtext && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {subtext}
          </div>
        )}
      </div>
    </div>
  );
}

export default StatCard;

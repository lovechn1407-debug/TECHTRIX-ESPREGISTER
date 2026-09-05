import React from 'react';

export function Card({
  children,
  accentBar = false,
  hoverLift = false,
  glass = false,
  className = '',
  onClick,
  ...props
}) {
  const classes = [
    'card',
    accentBar ? 'card-accent-bar' : '',
    hoverLift ? 'card-hover' : '',
    glass ? 'glass-surface' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} onClick={onClick} {...props}>
      {children}
    </div>
  );
}

export default Card;

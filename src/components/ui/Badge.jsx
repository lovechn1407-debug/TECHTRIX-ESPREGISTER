import React from 'react';
import { Clock, CheckCircle2, XCircle, Info } from 'lucide-react';

export function Badge({
  status = 'pending',
  label,
  pulse = false,
  showIcon = true,
  className = '',
}) {
  const normStatus = (status || 'pending').toLowerCase();

  let Icon = Info;
  if (normStatus === 'pending' || normStatus === 'reviewing') Icon = Clock;
  if (normStatus === 'approved') Icon = CheckCircle2;
  if (normStatus === 'declined') Icon = XCircle;

  const displayLabel = label || normStatus;

  return (
    <span
      className={`badge badge-${normStatus === 'reviewing' ? 'pending' : normStatus} ${
        pulse ? 'badge-pulse' : ''
      } ${className}`}
    >
      {showIcon && <Icon size={12} strokeWidth={2.5} />}
      <span>{displayLabel}</span>
    </span>
  );
}

export default Badge;

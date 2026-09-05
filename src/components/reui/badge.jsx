import React from 'react';
import { cn } from '@/lib/utils';

export function Badge({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
  ...props
}) {
  return (
    <span
      className={cn(
        'reui-badge',
        `reui-badge-${variant}`,
        `reui-badge-${size}`,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;

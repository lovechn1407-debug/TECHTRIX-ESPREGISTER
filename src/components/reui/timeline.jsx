import React from 'react';
import { cn } from '@/lib/utils';

export function Timeline({
  children,
  defaultValue,
  orientation = 'vertical',
  className = '',
  ...props
}) {
  return (
    <div
      data-orientation={orientation}
      className={cn('reui-timeline group/timeline', `reui-timeline-${orientation}`, className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function TimelineItem({
  children,
  step,
  className = '',
  ...props
}) {
  return (
    <div
      data-step={step}
      data-orientation="vertical"
      className={cn('reui-timeline-item', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function TimelineHeader({
  children,
  className = '',
  ...props
}) {
  return (
    <div className={cn('reui-timeline-header', className)} {...props}>
      {children}
    </div>
  );
}

export function TimelineSeparator({
  className = '',
  ...props
}) {
  return (
    <div
      aria-hidden="true"
      className={cn('reui-timeline-separator', className)}
      {...props}
    />
  );
}

export function TimelineIndicator({
  children,
  className = '',
  ...props
}) {
  return (
    <div className={cn('reui-timeline-indicator', className)} {...props}>
      {children}
    </div>
  );
}

export function TimelineTitle({
  children,
  className = '',
  ...props
}) {
  return (
    <h4 className={cn('reui-timeline-title', className)} {...props}>
      {children}
    </h4>
  );
}

export function TimelineContent({
  children,
  className = '',
  ...props
}) {
  return (
    <div className={cn('reui-timeline-content', className)} {...props}>
      {children}
    </div>
  );
}

export function TimelineDate({
  children,
  className = '',
  ...props
}) {
  return (
    <div className={cn('reui-timeline-date', className)} {...props}>
      {children}
    </div>
  );
}

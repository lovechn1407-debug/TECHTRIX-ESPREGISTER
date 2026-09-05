import React from 'react';
import { Badge } from '@/components/reui/badge';
import {
  Timeline as ReuiTimeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from '@/components/reui/timeline';
import { cn } from '@/lib/utils';
import { Check, X, Clock, RefreshCw, Send, AlertTriangle } from 'lucide-react';
import { formatDateTime } from '@/utils/helpers';
import { STATUS_LABELS } from '@/utils/constants';

export function Timeline({ history = [], currentStatus = 'pending', className = '' }) {
  if (!history || !history.length) {
    return (
      <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
        No status history recorded yet.
      </div>
    );
  }

  const getStatusConfig = (status) => {
    switch (status) {
      case 'submitted':
        return {
          title: 'Registration Submitted',
          badgeText: 'Submitted',
          badgeVariant: 'primary-light',
          indicatorBg: 'rgba(108, 92, 231, 0.95)',
          indicatorText: '#FFFFFF',
          icon: <Send size={13} strokeWidth={2.4} />,
          subtext: 'Entry received and queued for review',
        };
      case 'reviewing':
        return {
          title: 'Under Organizer Review',
          badgeText: 'In Review',
          badgeVariant: 'warning-light',
          indicatorBg: '#F59E0B',
          indicatorText: '#FFFFFF',
          icon: <Clock size={13} strokeWidth={2.4} />,
          subtext: 'Document and rank verification in progress',
        };
      case 'declined':
        return {
          title: 'Registration Declined',
          badgeText: 'Declined',
          badgeVariant: 'destructive-light',
          indicatorBg: '#EF4444',
          indicatorText: '#FFFFFF',
          icon: <X size={13} strokeWidth={2.5} />,
          subtext: 'Entry requires correction or does not meet criteria',
        };
      case 're-submitted':
        return {
          title: 'Updated & Re-submitted',
          badgeText: 'Re-submitted',
          badgeVariant: 'secondary-light',
          indicatorBg: '#00CEC9',
          indicatorText: '#FFFFFF',
          icon: <RefreshCw size={13} strokeWidth={2.4} />,
          subtext: 'Updated player roster re-submitted for evaluation',
        };
      case 'approved':
        return {
          title: 'Registration Approved',
          badgeText: 'Approved',
          badgeVariant: 'success-light',
          indicatorBg: '#10B981',
          indicatorText: '#FFFFFF',
          icon: <Check size={13} strokeWidth={2.6} />,
          subtext: 'Team confirmed and slot locked in match lobby',
        };
      default:
        return {
          title: STATUS_LABELS[status] || status,
          badgeText: status,
          badgeVariant: 'default',
          indicatorBg: 'var(--primary)',
          indicatorText: '#FFFFFF',
          icon: <Clock size={13} strokeWidth={2.4} />,
          subtext: '',
        };
    }
  };

  return (
    <div className={cn('w-full', className)}>
      <ReuiTimeline defaultValue={history.length}>
        {history.map((item, index) => {
          const config = getStatusConfig(item.status);
          const isLatest = index === history.length - 1;

          return (
            <TimelineItem
              key={`${item.status}-${item.timestamp}-${index}`}
              step={index + 1}
            >
              <TimelineHeader>
                <TimelineSeparator />

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <TimelineTitle>{config.title}</TimelineTitle>
                  <Badge variant={config.badgeVariant} size="sm">
                    {config.badgeText}
                  </Badge>
                </div>

                <TimelineIndicator
                  style={{
                    backgroundColor: config.indicatorBg,
                    color: config.indicatorText,
                    boxShadow: isLatest ? `0 0 0 3px rgba(108, 92, 231, 0.25)` : 'none',
                  }}
                >
                  {config.icon}
                </TimelineIndicator>
              </TimelineHeader>

              <TimelineContent>
                {config.subtext && (
                  <div className="reui-timeline-meta">
                    <span>{config.subtext}</span>
                  </div>
                )}

                <TimelineDate>
                  {formatDateTime(item.timestamp)}
                </TimelineDate>

                {item.status === 'declined' && item.reason && (
                  <div className="timeline-decline-box">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                      <AlertTriangle size={13} />
                      <span>Organizer Feedback:</span>
                    </div>
                    <div>{item.reason}</div>
                  </div>
                )}
              </TimelineContent>
            </TimelineItem>
          );
        })}
      </ReuiTimeline>
    </div>
  );
}

export default Timeline;

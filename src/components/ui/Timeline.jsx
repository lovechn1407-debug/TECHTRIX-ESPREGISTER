import React from 'react';
import { Send, Clock, XCircle, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { formatDateTime } from '../../utils/helpers';
import { STATUS_LABELS } from '../../utils/constants';

export function Timeline({ history = [], currentStatus = 'pending' }) {
  if (!history || !history.length) {
    return (
      <div className="timeline-empty" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        No status history recorded yet.
      </div>
    );
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'submitted':
        return <Send size={16} strokeWidth={2.2} />;
      case 'reviewing':
        return <Clock size={16} strokeWidth={2.2} />;
      case 'declined':
        return <XCircle size={16} strokeWidth={2.2} />;
      case 're-submitted':
        return <RefreshCw size={16} strokeWidth={2.2} />;
      case 'approved':
        return <CheckCircle2 size={16} strokeWidth={2.2} />;
      default:
        return <Clock size={16} strokeWidth={2.2} />;
    }
  };

  return (
    <div className="timeline" role="list">
      {history.map((item, index) => {
        const isLatest = index === history.length - 1;
        const label = STATUS_LABELS[item.status] || item.status;

        return (
          <div
            key={`${item.status}-${item.timestamp}-${index}`}
            className={`timeline-item status-${item.status} ${isLatest ? 'active' : ''}`}
            role="listitem"
          >
            <div className="timeline-node" aria-label={label}>
              {getStatusIcon(item.status)}
            </div>

            <div className="timeline-content">
              <div className="timeline-header">
                <span className="timeline-title">{label}</span>
                <span className="timeline-time">{formatDateTime(item.timestamp)}</span>
              </div>

              {item.status === 'declined' && item.reason && (
                <div className="timeline-reason">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, marginBottom: '0.2rem' }}>
                    <AlertTriangle size={14} />
                    <span>Reason for Decline:</span>
                  </div>
                  <div>{item.reason}</div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Timeline;

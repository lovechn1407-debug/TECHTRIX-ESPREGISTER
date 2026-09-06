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

export function Timeline({ history = [], currentStatus = 'pending', className = '' }) {
  // Normalize workflow stages based on history and current status
  const normalizedSteps = React.useMemo(() => {
    const list = Array.isArray(history) ? history : [];
    const submittedItem = list.find((h) => h.status === 'submitted') || list[0];
    const approvedItem = [...list].reverse().find((h) => h.status === 'approved');
    const latestDeclineItem = [...list].reverse().find((h) => h.status === 'declined');

    const steps = [];

    // 1. Initial Submission Step
    steps.push({
      id: 'submitted',
      status: 'submitted',
      title: 'Registration Submitted',
      badgeText: 'Submitted',
      badgeVariant: 'primary-light',
      indicatorBg: 'var(--primary)',
      indicatorText: '#FFFFFF',
      icon: <Check size={13} strokeWidth={2.8} />,
      subtext: 'Entry received and queued in tournament registry',
      timestamp: submittedItem?.timestamp || (list.length > 0 ? list[0].timestamp : Date.now()),
      stepState: 'completed',
    });

    // 2. Historical Decline & Resubmit cycles (if occurred previously)
    const allDeclines = list.filter((h) => h.status === 'declined');
    const allResubmits = list.filter((h) => h.status === 're-submitted');
    const completedCyclesCount = allResubmits.length;

    for (let i = 0; i < completedCyclesCount; i++) {
      const pastDecline = allDeclines[i];
      const pastResubmit = allResubmits[i];

      if (pastDecline) {
        steps.push({
          id: `declined-hist-${i}`,
          status: 'declined',
          title: completedCyclesCount > 1 ? `Correction Requested (#${i + 1})` : 'Correction Requested',
          badgeText: 'Declined',
          badgeVariant: 'destructive-light',
          indicatorBg: '#EF4444',
          indicatorText: '#FFFFFF',
          icon: <X size={13} strokeWidth={2.8} />,
          subtext: 'Organizer requested revisions to player roster or proofs',
          timestamp: pastDecline.timestamp,
          reason: pastDecline.reason,
          stepState: 'completed',
        });
      }

      if (pastResubmit) {
        steps.push({
          id: `resubmitted-hist-${i}`,
          status: 're-submitted',
          title: completedCyclesCount > 1 ? `Updated & Re-submitted (#${i + 1})` : 'Updated & Re-submitted',
          badgeText: 'Re-submitted',
          badgeVariant: 'secondary-light',
          indicatorBg: '#00CEC9',
          indicatorText: '#FFFFFF',
          icon: <RefreshCw size={13} strokeWidth={2.6} />,
          subtext: 'Revised player roster re-submitted for evaluation',
          timestamp: pastResubmit.timestamp,
          stepState: 'completed',
        });
      }
    }

    // 3. Organizer Review Step
    const isCurrentlyReviewing = currentStatus === 'pending' || currentStatus === 'reviewing';
    const isReviewCompleted = currentStatus === 'approved' || currentStatus === 'declined';
    const latestReviewItem = [...list].reverse().find((h) => h.status === 'reviewing');

    if (isCurrentlyReviewing) {
      steps.push({
        id: 'reviewing',
        status: 'reviewing',
        title: 'Under Organizer Review',
        badgeText: 'In Review',
        badgeVariant: 'warning-light',
        indicatorBg: '#F59E0B',
        indicatorText: '#FFFFFF',
        indicatorClass: 'indicator-active',
        icon: <Clock size={13} strokeWidth={2.5} />,
        subtext: 'Document, player UID & rank proof verification in progress',
        timestamp: latestReviewItem?.timestamp || null,
        inProgressText: 'In progress &middot; Actively being reviewed',
        stepState: 'active',
      });
    } else if (isReviewCompleted) {
      steps.push({
        id: 'reviewing',
        status: 'reviewing',
        title: 'Organizer Review Completed',
        badgeText: 'Verified',
        badgeVariant: 'success-light',
        indicatorBg: '#10B981',
        indicatorText: '#FFFFFF',
        icon: <Check size={13} strokeWidth={2.8} />,
        subtext: 'Player details and eligibility evaluated by tournament officials',
        timestamp: latestReviewItem?.timestamp || null,
        stepState: 'completed',
      });
    }

    // 4. Final Decision Step
    if (currentStatus === 'approved') {
      steps.push({
        id: 'approved',
        status: 'approved',
        title: 'Registration Approved & Confirmed',
        badgeText: 'Approved',
        badgeVariant: 'success-light',
        indicatorBg: '#10B981',
        indicatorText: '#FFFFFF',
        icon: <Check size={13} strokeWidth={2.8} />,
        subtext: 'Team confirmed and slot locked in tournament lobby',
        timestamp: approvedItem?.timestamp || Date.now(),
        stepState: 'completed',
      });
    } else if (currentStatus === 'declined') {
      const activeDecline = allDeclines[completedCyclesCount] || latestDeclineItem;
      steps.push({
        id: `declined-current-${activeDecline?.timestamp || Date.now()}`,
        status: 'declined',
        title: completedCyclesCount > 0 ? `Registration Declined (Review #${completedCyclesCount + 1})` : 'Registration Declined',
        badgeText: 'Declined',
        badgeVariant: 'destructive-light',
        indicatorBg: '#EF4444',
        indicatorText: '#FFFFFF',
        icon: <X size={13} strokeWidth={2.8} />,
        subtext: 'Entry requires correction or does not meet criteria',
        timestamp: activeDecline?.timestamp || Date.now(),
        reason: activeDecline?.reason || null,
        stepState: 'declined',
      });
    } else if (isCurrentlyReviewing) {
      // Upcoming confirmation step
      steps.push({
        id: 'upcoming-decision',
        status: 'upcoming',
        title: 'Slot Confirmation & Approval',
        badgeText: 'Pending',
        badgeVariant: 'outline',
        indicatorBg: '#F1F5F9',
        indicatorText: '#94A3B8',
        indicatorBorder: '1.5px dashed #CBD5E1',
        icon: <Clock size={12} strokeWidth={2.2} />,
        subtext: 'Final tournament slot allocation following review completion',
        timestamp: null,
        stepState: 'upcoming',
      });
    }

    return steps;
  }, [history, currentStatus]);

  // Compute separator classes between consecutive steps
  const stepsWithSeparators = React.useMemo(() => {
    return normalizedSteps.map((step, idx) => {
      if (idx === normalizedSteps.length - 1) {
        return { ...step, separatorClass: '' };
      }

      const nextStep = normalizedSteps[idx + 1];

      let sepClass = 'separator-completed';
      if (nextStep.stepState === 'active') {
        sepClass = 'separator-active';
      } else if (nextStep.stepState === 'upcoming') {
        sepClass = 'separator-upcoming';
      } else if (nextStep.stepState === 'declined') {
        sepClass = 'separator-declined';
      }

      return {
        ...step,
        separatorClass: sepClass,
      };
    });
  }, [normalizedSteps]);

  const activeIndex = stepsWithSeparators.findIndex((s) => s.stepState === 'active');
  const defaultStepValue = activeIndex !== -1 ? activeIndex + 1 : stepsWithSeparators.length;

  return (
    <div className={cn('w-full', className)}>
      <ReuiTimeline defaultValue={defaultStepValue}>
        {stepsWithSeparators.map((item, index) => {
          return (
            <TimelineItem
              key={`${item.id}-${index}`}
              step={index + 1}
            >
              <TimelineHeader>
                <TimelineSeparator className={item.separatorClass} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <TimelineTitle>{item.title}</TimelineTitle>
                  <Badge variant={item.badgeVariant} size="sm">
                    {item.badgeText}
                  </Badge>
                </div>

                <TimelineIndicator
                  className={cn(item.indicatorClass)}
                  style={{
                    backgroundColor: item.indicatorBg,
                    color: item.indicatorText,
                    border: item.indicatorBorder || 'none',
                  }}
                >
                  {item.icon}
                </TimelineIndicator>
              </TimelineHeader>

              <TimelineContent>
                {item.subtext && (
                  <div className="reui-timeline-meta">
                    <span>{item.subtext}</span>
                  </div>
                )}

                {item.timestamp ? (
                  <TimelineDate>
                    {formatDateTime(item.timestamp)}
                  </TimelineDate>
                ) : item.inProgressText ? (
                  <TimelineDate style={{ color: '#D97706', fontWeight: 600 }}>
                    {item.inProgressText}
                  </TimelineDate>
                ) : null}

                {item.reason && (
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

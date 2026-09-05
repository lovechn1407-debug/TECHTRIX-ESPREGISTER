import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ClipboardCheck,
  Calendar,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Edit3,
  Flame,
  ArrowRight,
  Shield,
  Phone,
  Inbox,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useUserSubmissions } from '../../hooks/useFirebase';
import { formatDate, formatDateTime, formatWhatsApp } from '../../utils/helpers';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Timeline from '../../components/ui/Timeline';
import Loading from '../../components/common/Loading';

export function CheckStatus() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { userSubs, loading } = useUserSubmissions(user?.uid);

  const [selectedSub, setSelectedSub] = useState(null);

  if (loading) {
    return <Loading message="Loading your registrations..." fullPage />;
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem 4rem 1.25rem' }}>
      <div className="status-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
          <ClipboardCheck size={28} color="var(--primary)" />
          <h1 style={{ fontSize: '2rem' }}>Your Registrations</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)' }}>
          Track real-time approval status and organizer notes for your tournament entries.
        </p>
      </div>

      {!userSubs || userSubs.length === 0 ? (
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            padding: '3.5rem 2rem',
            textAlign: 'center',
            boxShadow: 'var(--shadow-subtle)',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(108, 92, 231, 0.1)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto',
            }}
          >
            <Inbox size={32} />
          </div>
          <h3>No Registrations Found</h3>
          <p style={{ maxWidth: '420px', margin: '0.5rem auto 1.75rem auto', color: 'var(--text-secondary)' }}>
            You haven't submitted registrations for any upcoming tournaments yet. Explore open fixtures and secure your team slot!
          </p>
          <Button variant="primary" icon={ArrowRight} iconPosition="right" onClick={() => navigate('/')}>
            Browse Open Tournaments
          </Button>
        </div>
      ) : (
        <div className="submissions-user-list">
          {userSubs.map((sub) => {
            const isDeclined = sub.status === 'declined';
            const isApproved = sub.status === 'approved';
            const isPending = !isDeclined && !isApproved;

            return (
              <div
                key={sub.id}
                className="submission-item-card"
                onClick={() => setSelectedSub(sub)}
                role="button"
                tabIndex={0}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                    <span className="card-game-badge">
                      <Flame size={13} />
                      <span>Free Fire MAX</span>
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      ID: {sub.id?.substring(0, 10)}...
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.4rem' }}>
                    {sub.teamName || sub.players?.[0]?.nickname || 'Tournament Entry'}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.85rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calendar size={14} color="var(--primary)" />
                      <span>Submitted: {formatDate(sub.submittedAt)}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Users size={14} color="var(--secondary)" />
                      <span>{sub.players?.length || 1} Player{sub.players?.length > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Badge
                    status={sub.status}
                    pulse={isPending}
                    label={isPending ? 'Under Review' : sub.status}
                  />
                  <Button variant="secondary" size="sm">
                    View Timeline
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submission Details & Timeline Modal */}
      {selectedSub && (
        <Modal
          isOpen={Boolean(selectedSub)}
          onClose={() => setSelectedSub(null)}
          title="Registration Details & Timeline"
          maxWidth="640px"
          footer={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div>
                {selectedSub.status === 'declined' && (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Edit3}
                    onClick={() => {
                      const formId = selectedSub.formId;
                      const subId = selectedSub.id;
                      setSelectedSub(null);
                      navigate(`/register/${formId}?editSubmissionId=${subId}`);
                    }}
                  >
                    Re-edit & Resubmit
                  </Button>
                )}
              </div>
              <Button variant="secondary" size="sm" onClick={() => setSelectedSub(null)}>
                Close
              </Button>
            </div>
          }
        >
          <div>
            {/* Header info */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '1rem',
                borderBottom: '1px solid var(--border)',
                marginBottom: '1.25rem',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.2rem' }}>
                  {selectedSub.teamName || selectedSub.players?.[0]?.nickname}
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Submitted on {formatDateTime(selectedSub.submittedAt)}
                </span>
              </div>
              <Badge
                status={selectedSub.status}
                pulse={selectedSub.status === 'pending'}
                label={selectedSub.status === 'pending' ? 'Under Review' : selectedSub.status}
              />
            </div>

            {/* Vertical Timeline */}
            <div>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                Status Progression
              </h4>
              <Timeline
                history={selectedSub.statusHistory || []}
                currentStatus={selectedSub.status}
              />
            </div>

            {/* Players Roster */}
            <div style={{ marginTop: '1.75rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.85rem' }}>
                Registered Players ({selectedSub.players?.length || 0})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {selectedSub.players?.map((pl, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#FAFBFF',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.75rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                        {pl.nickname}{' '}
                        <span className="tag-mono" style={{ fontSize: '0.75rem', marginLeft: '0.35rem' }}>
                          UID: {pl.uid}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        Level {pl.level} | Rank: {pl.rank} ({pl.rankPoints} pts)
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {formatWhatsApp(pl.whatsapp)}
                      </span>
                      {pl.apiVerified && (
                        <span title="API Verified" style={{ color: 'var(--success)' }}>
                          <CheckCircle2 size={16} />
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default CheckStatus;

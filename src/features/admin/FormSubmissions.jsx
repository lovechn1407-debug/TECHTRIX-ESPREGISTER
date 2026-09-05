import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  Users,
  Shield,
  Phone,
  ExternalLink,
  Flame,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Inbox,
  Filter,
} from 'lucide-react';
import { useFormDetails, useFormSubmissions, updateSubmissionStatus } from '../../hooks/useFirebase';
import { formatDate, formatDateTime, formatWhatsApp } from '../../utils/helpers';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Loading from '../../components/common/Loading';

export function FormSubmissions() {
  const { formId } = useParams();
  const navigate = useNavigate();
  const { form, loading: formLoading } = useFormDetails(formId);
  const { submissions, loading: subsLoading } = useFormSubmissions(formId);
  const { showSuccess, showError } = useToast();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'pending' | 'approved' | 'declined'
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [viewingSub, setViewingSub] = useState(null);
  const [decliningSub, setDecliningSub] = useState(null);
  const [declineReason, setDeclineReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Summary counts
  const totalCount = submissions.length;
  const pendingCount = submissions.filter((s) => s.status === 'pending').length;
  const approvedCount = submissions.filter((s) => s.status === 'approved').length;
  const declinedCount = submissions.filter((s) => s.status === 'declined').length;

  // Filtered submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      // Tab filter
      if (activeTab !== 'all' && sub.status !== activeTab) {
        return false;
      }
      // Search filter (player name, team name, or player UID)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTeam = sub.teamName?.toLowerCase().includes(q);
        const matchesPlayer = sub.players?.some(
          (p) => p.nickname?.toLowerCase().includes(q) || String(p.uid).includes(q)
        );
        return matchesTeam || matchesPlayer;
      }
      return true;
    });
  }, [submissions, activeTab, searchQuery]);

  // Handle Approve
  const handleApprove = async (sub) => {
    setActionLoading(true);
    try {
      await updateSubmissionStatus(formId, sub.id, 'approved');
      showSuccess(`Approved registration for "${sub.teamName || sub.players?.[0]?.nickname}"`, 'Registration Approved');
      if (viewingSub && viewingSub.id === sub.id) {
        setViewingSub((prev) => ({ ...prev, status: 'approved' }));
      }
    } catch (err) {
      showError('Failed to approve registration', 'Error');
    } finally {
      setActionLoading(false);
    }
  };

  // Open Decline Modal
  const openDeclineModal = (sub) => {
    setDecliningSub(sub);
    setDeclineReason('');
  };

  // Confirm Decline with Reason
  const handleConfirmDecline = async () => {
    if (!decliningSub) return;
    if (!declineReason.trim()) {
      showError('Please provide a reason for declining the registration.', 'Reason Required');
      return;
    }

    setActionLoading(true);
    try {
      await updateSubmissionStatus(formId, decliningSub.id, 'declined', declineReason.trim());
      showSuccess(`Declined entry for "${decliningSub.teamName || decliningSub.players?.[0]?.nickname}"`, 'Registration Declined');
      if (viewingSub && viewingSub.id === decliningSub.id) {
        setViewingSub((prev) => ({ ...prev, status: 'declined', declineReason: declineReason.trim() }));
      }
      setDecliningSub(null);
    } catch (err) {
      showError('Failed to decline submission', 'Error');
    } finally {
      setActionLoading(false);
    }
  };

  if (formLoading || subsLoading) {
    return <Loading message="Loading tournament submissions..." fullPage />;
  }

  if (!form) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h3>Tournament Not Found</h3>
        <p style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
          This tournament form does not exist.
        </p>
        <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/admin/forms')}>
          Back to Forms
        </Button>
      </div>
    );
  }

  return (
    <div className="admin-submissions-page">
      {/* Back button and Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to="/admin/forms"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--text-secondary)',
            fontSize: '0.88rem',
            fontWeight: 600,
            marginBottom: '0.75rem',
          }}
        >
          <ArrowLeft size={16} />
          <span>All Tournament Forms</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <span className="card-game-badge">
            <Flame size={13} />
            <span>{form.gameTitle || form.gameName}</span>
          </span>
          <span className="tag-mono">{form.teamType?.toUpperCase() || 'SOLO'}</span>
        </div>
        <h1 style={{ fontSize: '1.85rem' }}>{form.formName} Submissions</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Review player documents, verify credentials, and manage approval status.
        </p>
      </div>

      {/* Summary KPI Badges Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div style={{ background: '#FFFFFF', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Total Submissions
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '0.2rem', color: 'var(--text-primary)' }}>
            {totalCount}
          </div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#B7791F', textTransform: 'uppercase' }}>
            Pending Review
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '0.2rem', color: '#B7791F' }}>
            {pendingCount}
          </div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--success)', textTransform: 'uppercase' }}>
            Approved
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '0.2rem', color: 'var(--success)' }}>
            {approvedCount}
          </div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--danger)', textTransform: 'uppercase' }}>
            Declined
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '0.2rem', color: 'var(--danger)' }}>
            {declinedCount}
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="table-filter-bar">
        <div className="filter-tabs">
          <button
            type="button"
            className={`filter-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All ({totalCount})
          </button>
          <button
            type="button"
            className={`filter-tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending ({pendingCount})
          </button>
          <button
            type="button"
            className={`filter-tab-btn ${activeTab === 'approved' ? 'active' : ''}`}
            onClick={() => setActiveTab('approved')}
          >
            Approved ({approvedCount})
          </button>
          <button
            type="button"
            className={`filter-tab-btn ${activeTab === 'declined' ? 'active' : ''}`}
            onClick={() => setActiveTab('declined')}
          >
            Declined ({declinedCount})
          </button>
        </div>

        <div className="table-search-box">
          <Search className="table-search-icon" size={18} />
          <input
            type="text"
            className="input-field"
            placeholder="Search by player name or UID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Submissions List Table */}
      <div className="custom-table-card">
        {filteredSubmissions.length === 0 ? (
          <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
            <Inbox size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem auto' }} />
            <h4>No Submissions In This View</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              No player registrations match the selected filter or search keyword.
            </p>
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Player / Team Name</th>
                <th>Game UID(s)</th>
                <th>Submitted On</th>
                <th>API Verification</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.map((sub) => {
                const isSolo = form.teamType === 'solo';
                const displayName = isSolo ? sub.players?.[0]?.nickname : sub.teamName;
                const isApiVerified = sub.players?.every((p) => p.apiVerified);

                return (
                  <tr key={sub.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {sub.teamLogo && (
                          <img
                            src={sub.teamLogo}
                            alt="Team"
                            style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                          />
                        )}
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.98rem' }}>{displayName}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            by {sub.userName || sub.userEmail}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        {sub.players?.map((p, pIdx) => (
                          <span key={pIdx} className="tag-mono" style={{ fontSize: '0.75rem', width: 'fit-content' }}>
                            {p.nickname}: {p.uid}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {formatDate(sub.submittedAt)}
                    </td>

                    <td>
                      {isApiVerified ? (
                        <span style={{ color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', fontWeight: 600 }}>
                          <CheckCircle2 size={14} />
                          <span>Verified ✓</span>
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500 }}>
                          Manual Entry
                        </span>
                      )}
                    </td>

                    <td>
                      <Badge
                        status={sub.status}
                        pulse={sub.status === 'pending'}
                        label={sub.status}
                      />
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={Eye}
                          onClick={() => setViewingSub(sub)}
                        >
                          View Details
                        </Button>

                        {sub.status !== 'approved' && (
                          <Button
                            variant="success"
                            size="sm"
                            icon={CheckCircle}
                            onClick={() => handleApprove(sub)}
                          >
                            Approve
                          </Button>
                        )}

                        {sub.status !== 'declined' && (
                          <Button
                            variant="danger"
                            size="sm"
                            icon={XCircle}
                            onClick={() => openDeclineModal(sub)}
                          >
                            Decline
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* VIEW DETAILS MODAL */}
      {viewingSub && (
        <Modal
          isOpen={Boolean(viewingSub)}
          onClose={() => setViewingSub(null)}
          title={`Submission: ${viewingSub.teamName || viewingSub.players?.[0]?.nickname}`}
          maxWidth="700px"
          footer={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {viewingSub.status !== 'approved' && (
                  <Button
                    variant="success"
                    size="sm"
                    icon={CheckCircle}
                    onClick={() => handleApprove(viewingSub)}
                  >
                    Approve Entry
                  </Button>
                )}
                {viewingSub.status !== 'declined' && (
                  <Button
                    variant="danger"
                    size="sm"
                    icon={XCircle}
                    onClick={() => openDeclineModal(viewingSub)}
                  >
                    Decline Entry
                  </Button>
                )}
              </div>
              <Button variant="secondary" size="sm" onClick={() => setViewingSub(null)}>
                Close
              </Button>
            </div>
          }
        >
          <div>
            {/* Header info */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Submitted by {viewingSub.userName} ({viewingSub.userEmail}) on {formatDateTime(viewingSub.submittedAt)}
                </span>
              </div>
              <Badge status={viewingSub.status} label={viewingSub.status} />
            </div>

            {/* Team Logo preview if present */}
            {viewingSub.teamLogo && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', padding: '0.75rem', background: '#FAFBFF', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <img
                  src={viewingSub.teamLogo}
                  alt="Team Logo"
                  style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Team Logo</div>
                  <a
                    href={viewingSub.teamLogo}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.2rem' }}
                  >
                    <span>View full image</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            )}

            {/* If declined, show reason */}
            {viewingSub.status === 'declined' && viewingSub.declineReason && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  background: 'rgba(255, 118, 117, 0.08)',
                  borderLeft: '4px solid var(--danger)',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--danger)', marginBottom: '0.25rem' }}>
                  Decline Reason:
                </div>
                <div style={{ fontSize: '0.88rem', color: '#C0392B' }}>{viewingSub.declineReason}</div>
              </div>
            )}

            {/* Player Roster Breakdown */}
            <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Player Roster & Documents</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {viewingSub.players?.map((p, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    boxShadow: 'var(--shadow-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>Player {idx + 1}: {p.nickname}</span>
                      <span className="tag-mono" style={{ fontSize: '0.75rem' }}>UID: {p.uid}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {p.apiVerified ? (
                        <span style={{ color: 'var(--success)', fontSize: '0.78rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                          <CheckCircle2 size={13} />
                          API Verified
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                          Manual Verification
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginTop: '0.75rem', fontSize: '0.85rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Level:</span>
                      <div style={{ fontWeight: 600 }}>Level {p.level}</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>BR Rank:</span>
                      <div style={{ fontWeight: 600 }}>{p.rank} ({p.rankPoints} pts)</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Region:</span>
                      <div style={{ fontWeight: 600 }}>{p.region || 'IND'}</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>WhatsApp:</span>
                      <div style={{ fontWeight: 600 }}>{formatWhatsApp(p.whatsapp)}</div>
                    </div>
                  </div>

                  {p.profileImage && (
                    <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={p.profileImage}
                        alt="Profile Screenshot"
                        style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>Profile Screenshot</div>
                        <a
                          href={p.profileImage}
                          target="_blank"
                          rel="noreferrer"
                          style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
                        >
                          <span>Open image</span>
                          <ExternalLink size={10} />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* DECLINE REASON MODAL */}
      {decliningSub && (
        <Modal
          isOpen={Boolean(decliningSub)}
          onClose={() => setDecliningSub(null)}
          title="Decline Tournament Registration"
          footer={
            <>
              <Button variant="secondary" onClick={() => setDecliningSub(null)}>
                Cancel
              </Button>
              <Button
                variant="danger-solid"
                loading={actionLoading}
                onClick={handleConfirmDecline}
              >
                Confirm Decline
              </Button>
            </>
          }
        >
          <div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Specify the reason for declining <strong>{decliningSub.teamName || decliningSub.players?.[0]?.nickname}</strong>. This explanation will be displayed directly to the player on their timeline and enables them to re-edit their entry.
            </p>

            <Input
              label="Decline Reason"
              placeholder="e.g. Player 2 rank does not meet Heroic requirement, or screenshot is blurry"
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              required
            />
          </div>
        </Modal>
      )}
    </div>
  );
}

export default FormSubmissions;

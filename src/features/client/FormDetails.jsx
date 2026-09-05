import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Swords,
  Users,
  Shield,
  Award,
  Clock,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import { useFormDetails } from '../../hooks/useFirebase';
import { formatDate, formatDateTime, isFormClosed, isSlotsFull } from '../../utils/helpers';
import Button from '../../components/ui/Button';
import Loading from '../../components/common/Loading';

export function FormDetails() {
  const { formId } = useParams();
  const navigate = useNavigate();
  const { form, loading } = useFormDetails(formId);

  if (loading) {
    return <Loading message="Loading tournament details..." fullPage />;
  }

  if (!form) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h3>Tournament Not Found</h3>
        <p style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
          The tournament registration you are looking for may have been removed or closed.
        </p>
        <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/')}>
          Back to Tournaments
        </Button>
      </div>
    );
  }

  const closed = isFormClosed(form);
  const full = isSlotsFull(form);
  const isLimited = form.maxRegistrations && form.maxRegistrations !== 'unlimited';
  const maxSlots = isLimited ? Number(form.maxRegistrations) : 0;
  const registeredCount = Number(form.submissionCount || 0);

  return (
    <div className="form-details-page">
      {/* Details Hero */}
      <section className="details-hero">
        <div className="container">
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#FFFFFF',
              fontSize: '0.88rem',
              fontWeight: 600,
              marginBottom: '1.5rem',
              opacity: 0.85,
            }}
          >
            <ArrowLeft size={16} />
            <span>All Tournaments</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(6px)',
                padding: '0.25rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#FFFFFF',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <Flame size={13} />
              <span>{form.gameTitle || form.gameName || 'Free Fire MAX'}</span>
            </span>
            <span
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                padding: '0.25rem 0.65rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#FFFFFF',
              }}
            >
              {form.shortName || 'TOURNAMENT'}
            </span>
          </div>

          <h1 style={{ color: '#FFFFFF', fontSize: '2.5rem', marginBottom: '1rem' }}>
            {form.formName}
          </h1>

          <p style={{ color: 'rgba(255, 255, 255, 0.9)', maxWidth: '640px', fontSize: '1.05rem' }}>
            Official registered tournament hosted on TechTrix Esports. Verified player registration and competitive rules applied.
          </p>
        </div>
      </section>

      {/* Main Container with Floating Stats Grid */}
      <div className="container">
        <div className="details-grid">
          {/* Left Details Column */}
          <div>
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '2rem',
                boxShadow: 'var(--shadow-subtle)',
                marginBottom: '2rem',
              }}
            >
              <h3 style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                Tournament Specifications
              </h3>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1.25rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div className="info-stat-box">
                  <Swords size={24} color="var(--primary)" />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                      Game Mode
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: '0.2rem' }}>
                      {form.gameMode || 'BR-DEFAULT'}
                    </div>
                  </div>
                </div>

                <div className="info-stat-box">
                  <Users size={24} color="var(--secondary)" />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                      Team Format
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: '0.2rem', textTransform: 'capitalize' }}>
                      {form.teamType || 'Solo'}
                    </div>
                  </div>
                </div>

                <div className="info-stat-box">
                  <Award size={24} color="#E5A93C" />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                      Min Player Level
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: '0.2rem' }}>
                      Level {form.minLevel || 1}+
                    </div>
                  </div>
                </div>

                <div className="info-stat-box">
                  <Shield size={24} color="var(--primary)" />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                      Min BR Rank
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: '0.2rem' }}>
                      {form.minBRRank || 'Bronze'}+
                    </div>
                  </div>
                </div>

                <div className="info-stat-box">
                  <Calendar size={24} color="var(--success)" />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                      Tournament Date
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: '0.2rem' }}>
                      {form.tournamentDate ? formatDate(form.tournamentDate) : 'TBA'}
                    </div>
                  </div>
                </div>

                <div className="info-stat-box">
                  <Clock size={24} color="var(--danger)" />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                      Deadline
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: '0.2rem' }}>
                      {form.scheduleType === 'custom' && form.closingTime
                        ? formatDateTime(form.closingTime)
                        : 'Until Closed by Admin'}
                    </div>
                  </div>
                </div>
              </div>

              <h4 style={{ marginBottom: '0.75rem', marginTop: '1.5rem' }}>Registration Rules & Verification</h4>
              <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7 }}>
                <li>
                  Verification Method:{' '}
                  <strong>
                    {form.verificationMethod === 'manual' ? 'Manual Verification' : 'Automated Free Fire API Verification'}
                  </strong>
                </li>
                {form.duplicacyCheck && (
                  <li>Anti-duplication active: Unique Game UIDs are enforced per entry.</li>
                )}
                {form.requireTeamLogo && <li>Team Logo upload is required for this tournament.</li>}
                {form.requirePlayerImages && (
                  <li>Player profile image upload is required for verification.</li>
                )}
                <li>Valid Indian WhatsApp phone numbers (+91) required for match room coordination.</li>
              </ul>
            </div>
          </div>

          {/* Right Action Sidebar Card */}
          <div>
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.75rem',
                boxShadow: 'var(--shadow-medium)',
                position: 'sticky',
                top: '90px',
              }}
            >
              <h3 style={{ marginBottom: '0.5rem' }}>Registration Status</h3>

              {closed ? (
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'rgba(255, 118, 117, 0.1)',
                    borderLeft: '4px solid var(--danger)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--danger)',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    margin: '1rem 0',
                  }}
                >
                  Registration for this tournament is closed.
                </div>
              ) : full ? (
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'rgba(253, 203, 110, 0.2)',
                    borderLeft: '4px solid var(--warning)',
                    borderRadius: 'var(--radius-sm)',
                    color: '#B7791F',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    margin: '1rem 0',
                  }}
                >
                  All tournament slots have been filled.
                </div>
              ) : (
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'rgba(0, 184, 148, 0.12)',
                    borderLeft: '4px solid var(--success)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--success)',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    margin: '1rem 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <CheckCircle2 size={18} />
                  <span>Registrations are currently open!</span>
                </div>
              )}

              <div style={{ margin: '1.5rem 0', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Registered Teams:</span>
                  <span style={{ fontWeight: 700 }}>
                    {isLimited ? `${registeredCount} / ${maxSlots}` : `${registeredCount} (Unlimited)`}
                  </span>
                </div>

                {isLimited && (
                  <div className="slots-progress-track">
                    <div
                      className="slots-progress-fill"
                      style={{ width: `${Math.min(100, (registeredCount / maxSlots) * 100)}%` }}
                    />
                  </div>
                )}
              </div>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                disabled={closed || full}
                onClick={() => navigate(`/register/${form.id}`)}
              >
                {closed ? 'Registration Closed' : full ? 'Slots Full' : 'Register Now'}
              </Button>

              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <Link to="/" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  View other tournaments
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FormDetails;

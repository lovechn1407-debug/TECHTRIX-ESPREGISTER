import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Trophy,
  Swords,
  User,
  Users,
  UsersRound,
  Calendar,
  BarChart3,
  Flame,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  Inbox,
  AlertCircle,
} from 'lucide-react';
import { useForms } from '../../hooks/useFirebase';
import { formatDate, isFormClosed, isSlotsFull } from '../../utils/helpers';
import Button from '../../components/ui/Button';
import Loading from '../../components/common/Loading';

export function Home() {
  const { forms, loading } = useForms();
  const navigate = useNavigate();

  const scrollToTournaments = () => {
    const el = document.getElementById('tournaments-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getTeamTypeIcon = (teamType) => {
    const type = (teamType || 'solo').toLowerCase();
    if (type === 'duo') return <Users size={16} />;
    if (type === 'squad') return <UsersRound size={16} />;
    return <User size={16} />;
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-shape-1" aria-hidden="true" />
        <div className="hero-shape-2" aria-hidden="true" />

        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={16} />
            <span>TechTrix Season 2026</span>
          </div>

          <h1 className="hero-title">Register for Esports Tournaments</h1>

          <p className="hero-subtitle">
            Compete. Conquer. Champion. Join elite battle royale tournaments with instant Free Fire player verification and seamless slot tracking.
          </p>

          <div className="hero-cta-group">
            <Button
              variant="primary"
              size="lg"
              className="hero-btn-primary"
              icon={ArrowRight}
              iconPosition="right"
              onClick={scrollToTournaments}
            >
              Browse Tournaments
            </Button>
            <Link to="/status">
              <Button
                variant="secondary"
                size="lg"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  borderColor: 'rgba(255, 255, 255, 0.35)',
                  color: '#FFFFFF',
                  backdropFilter: 'blur(8px)',
                }}
              >
                Track My Registrations
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Highlights Banner */}
      <section
        style={{
          background: '#FFFFFF',
          borderBottom: '1px solid var(--border)',
          padding: '1.75rem 0',
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(108, 92, 231, 0.1)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Zap size={22} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Instant API Verification</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Live stats fetched directly from Free Fire servers
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(0, 206, 201, 0.12)',
                  color: 'var(--secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <ShieldCheck size={22} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Anti-Duplicacy System</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Fair competition with strict UID enforcement
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(0, 184, 148, 0.12)',
                  color: 'var(--success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Trophy size={22} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Real-time Status Tracking</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Interactive timeline from submission to approval
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Open Registrations Section */}
      <section id="tournaments-section" className="tournaments-section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">
                <Trophy size={28} color="var(--primary)" />
                <span>Open Registrations</span>
              </h2>
              <p style={{ marginTop: '0.25rem' }}>
                Select an active tournament and secure your team slot before entries close.
              </p>
            </div>
          </div>

          {loading ? (
            <Loading message="Loading tournaments..." />
          ) : forms.length === 0 ? (
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border)',
                padding: '4rem 2rem',
                textAlign: 'center',
                boxShadow: 'var(--shadow-subtle)',
              }}
            >
              <div
                style={{
                  width: '68px',
                  height: '68px',
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
              <h3 style={{ marginBottom: '0.5rem' }}>No Tournaments Open Right Now</h3>
              <p style={{ maxWidth: '440px', margin: '0 auto 1.5rem auto' }}>
                All current tournaments have concluded. Check back soon for exciting upcoming fixtures and championships!
              </p>
            </div>
          ) : (
            <div className="tournaments-grid">
              {forms.map((form, index) => {
                const closed = isFormClosed(form);
                const full = isSlotsFull(form);
                const isLimited = form.maxRegistrations && form.maxRegistrations !== 'unlimited';
                const maxSlots = isLimited ? Number(form.maxRegistrations) : 0;
                const registeredCount = Number(form.submissionCount || 0);
                const slotPercent = isLimited && maxSlots > 0 ? (registeredCount / maxSlots) * 100 : 0;

                const lastDateLabel =
                  form.scheduleType === 'custom' && form.closingTime
                    ? formatDate(form.closingTime)
                    : 'Open until closed';

                return (
                  <div
                    key={form.id}
                    className="tournament-card"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <div className="card-top-gradient" />

                    <div className="card-content-wrap">
                      <div className="card-game-row">
                        <span className="card-game-badge">
                          <Flame size={13} />
                          <span>{form.gameName || 'Free Fire'}</span>
                        </span>

                        {closed ? (
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              color: 'var(--danger)',
                              background: 'rgba(255, 118, 117, 0.12)',
                              padding: '0.2rem 0.55rem',
                              borderRadius: 'var(--radius-full)',
                            }}
                          >
                            Closed
                          </span>
                        ) : full ? (
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              color: '#B7791F',
                              background: 'rgba(253, 203, 110, 0.2)',
                              padding: '0.2rem 0.55rem',
                              borderRadius: 'var(--radius-full)',
                            }}
                          >
                            Slots Full
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              color: 'var(--success)',
                              background: 'rgba(0, 184, 148, 0.12)',
                              padding: '0.2rem 0.55rem',
                              borderRadius: 'var(--radius-full)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                          >
                            <span
                              style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: 'var(--success)',
                              }}
                            />
                            Open Now
                          </span>
                        )}
                      </div>

                      <h3 className="card-form-title">{form.formName}</h3>

                      <div className="tournament-meta-list">
                        <div className="meta-row">
                          <Swords size={15} />
                          <span>Mode: {form.gameMode || 'BR-DEFAULT'}</span>
                        </div>
                        <div className="meta-row">
                          {getTeamTypeIcon(form.teamType)}
                          <span style={{ textTransform: 'capitalize' }}>
                            Team Type: {form.teamType || 'Solo'}
                          </span>
                        </div>
                        <div className="meta-row">
                          <Calendar size={15} />
                          <span>Closing: {lastDateLabel}</span>
                        </div>
                        <div className="meta-row">
                          <BarChart3 size={15} />
                          <span>
                            {isLimited
                              ? `${registeredCount} / ${maxSlots} registered`
                              : `${registeredCount} registered (Unlimited)`}
                          </span>
                        </div>
                      </div>

                      {isLimited && (
                        <div className="card-slots-bar">
                          <div className="slots-label-row">
                            <span>Slots Availability</span>
                            <span>{Math.min(100, Math.round(slotPercent))}% Filled</span>
                          </div>
                          <div className="slots-progress-track">
                            <div
                              className="slots-progress-fill"
                              style={{ width: `${Math.min(100, slotPercent)}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="card-actions-row">
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={closed || full}
                          onClick={() => navigate(`/register/${form.id}`)}
                        >
                          {closed ? 'Closed' : full ? 'Full' : 'Fill Now'}
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigate(`/form/${form.id}`)}
                        >
                          Details
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Home;

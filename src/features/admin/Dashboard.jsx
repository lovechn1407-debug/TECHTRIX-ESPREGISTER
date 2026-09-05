import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Gamepad2,
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  Flame,
  ArrowRight,
  Inbox,
  Shield,
} from 'lucide-react';
import { useForms, useAllSubmissions } from '../../hooks/useFirebase';
import { getRelativeTime } from '../../utils/helpers';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Loading from '../../components/common/Loading';

export function Dashboard() {
  const navigate = useNavigate();
  const { forms, loading: formsLoading } = useForms();
  const { allSubmissions, loading: subsLoading } = useAllSubmissions();

  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimedOut(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const loading = (formsLoading || subsLoading) && !timedOut;

  // Calculate statistics
  const totalRegistrations = allSubmissions.length;
  const approvedCount = allSubmissions.filter((s) => s.status === 'approved').length;
  const pendingCount = allSubmissions.filter((s) => s.status === 'pending').length;
  const declinedCount = allSubmissions.filter((s) => s.status === 'declined').length;
  // Currently Free Fire is primary
  const freeFireCount = allSubmissions.length;

  const recentSubmissions = allSubmissions.slice(0, 10);

  // Helper to find form name by formId
  const getFormName = (formId) => {
    const found = forms.find((f) => f.id === formId);
    return found ? found.formName : 'Tournament';
  };

  if (loading) {
    return <Loading message="Syncing dashboard data with Firebase..." fullPage />;
  }

  return (
    <div className="admin-dashboard-page">
      {/* Top Bar with Greeting & CTA */}
      <div className="dashboard-top-bar">
        <div>
          <h1 style={{ fontSize: '1.85rem' }}>Tournament Control Center</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Real-time player registrations, approval workflows, and tournament metrics.
          </p>
        </div>

        <Button
          variant="primary"
          size="lg"
          icon={Plus}
          onClick={() => navigate('/admin/create')}
          style={{
            background: 'var(--hero-gradient)',
            boxShadow: '0 6px 20px rgba(108, 92, 231, 0.35)',
          }}
        >
          Create Registration
        </Button>
      </div>

      {/* Stats Cards Row */}
      <div className="dashboard-stats-grid">
        <StatCard
          title="Total Registrations"
          value={totalRegistrations}
          icon={Users}
          color="#6C5CE7"
          bgColor="rgba(108, 92, 231, 0.1)"
        />

        <StatCard
          title="Free Fire MAX Entries"
          value={freeFireCount}
          icon={Gamepad2}
          color="#00CEC9"
          bgColor="rgba(0, 206, 201, 0.12)"
        />

        <StatCard
          title="Approved Registrations"
          value={approvedCount}
          icon={CheckCircle}
          color="#00B894"
          bgColor="rgba(0, 184, 148, 0.12)"
        />

        <StatCard
          title="Pending Review"
          value={pendingCount}
          icon={Clock}
          color="#E5A93C"
          bgColor="rgba(253, 203, 110, 0.2)"
        />

        <StatCard
          title="Declined"
          value={declinedCount}
          icon={XCircle}
          color="#FF7675"
          bgColor="rgba(255, 118, 117, 0.12)"
        />
      </div>

      {/* Recent Registrations Real-Time Feed */}
      <div className="recent-feed-section">
        <div className="recent-feed-header">
          <div>
            <h3 style={{ fontSize: '1.15rem' }}>Recent Registrations Feed</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Live stream of latest submissions across all tournaments
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            icon={ArrowRight}
            iconPosition="right"
            onClick={() => navigate('/admin/forms')}
          >
            Manage All Forms
          </Button>
        </div>

        {recentSubmissions.length === 0 ? (
          <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: 'rgba(108, 92, 231, 0.08)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto',
              }}
            >
              <Inbox size={26} />
            </div>
            <h4>No Registrations Recorded Yet</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Submissions from players will appear here in real-time as they register.
            </p>
          </div>
        ) : (
          <div className="recent-feed-list">
            {recentSubmissions.map((sub) => {
              const displayName = sub.teamName || sub.players?.[0]?.nickname || 'Player Entry';
              const targetFormName = getFormName(sub.formId);

              return (
                <div
                  key={sub.id}
                  className="recent-feed-item"
                  onClick={() => navigate(`/admin/forms/${sub.formId}`)}
                  title="Click to view form submissions"
                >
                  <div className="feed-item-left">
                    <div className="feed-avatar-badge">
                      <Flame size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--text-primary)' }}>
                        {displayName}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                        Free Fire MAX • <strong>{targetFormName}</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {getRelativeTime(sub.submittedAt)}
                    </span>
                    <Badge
                      status={sub.status}
                      pulse={sub.status === 'pending'}
                      label={sub.status === 'pending' ? 'Reviewing' : sub.status}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;

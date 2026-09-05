import React from 'react';
import { useLocation } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../ui/Button';
import Loading from './Loading';

export function ProtectedRoute({ children }) {
  const { user, loading, loginWithGoogle } = useAuth();
  const { showError, showSuccess } = useToast();
  const location = useLocation();

  if (loading) {
    return <Loading message="Authenticating session..." fullPage />;
  }

  if (!user) {
    const handleLogin = async () => {
      try {
        const u = await loginWithGoogle();
        showSuccess(`Welcome back, ${u.displayName || 'Player'}!`, 'Authenticated');
      } catch (err) {
        showError(err.message || 'Google Sign-In failed', 'Authentication Error');
      }
    };

    return (
      <div className="container" style={{ padding: '4rem 1.25rem' }}>
        <div className="auth-gate-card">
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
            <LogIn size={28} />
          </div>
          <h2 style={{ marginBottom: '0.75rem' }}>Please sign in to continue</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.5 }}>
            To fill out tournament registrations or review your submitted entries, please sign in with your Google account.
          </p>
          <Button
            variant="primary"
            size="lg"
            icon={LogIn}
            fullWidth
            onClick={handleLogin}
          >
            Sign In with Google
          </Button>
        </div>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;

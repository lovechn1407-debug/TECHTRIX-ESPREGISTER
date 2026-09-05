import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Trophy, Shield, Lock, Mail, AlertCircle, ArrowLeft, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { adminLogin, adminGoogleLogin } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await adminLogin(email.trim(), password);
      showSuccess('Administrator session authenticated successfully.', 'Welcome Admin');
      navigate('/admin');
    } catch (err) {
      console.error('Admin login error:', err);
      if (err.code === 'auth/unauthorized-admin') {
        setError(err.message);
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('Invalid admin credentials. Please verify your email and password.');
      } else {
        setError(err.message || 'Failed to authenticate administrator.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAdminLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await adminGoogleLogin();
      showSuccess('Administrator session authenticated via Google.', 'Welcome Admin');
      navigate('/admin');
    } catch (err) {
      console.error('Admin Google login error:', err);
      setError(err.message || 'Failed to authenticate via Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div
            className="brand-icon-box"
            style={{ width: '48px', height: '48px', margin: '0 auto 1rem auto' }}
          >
            <Shield size={24} strokeWidth={2.5} />
          </div>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '0.35rem' }}>Administrator Portal</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            TechTrix Esports Management System
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '0.85rem 1rem',
              background: 'rgba(255, 118, 117, 0.1)',
              border: '1px solid rgba(255, 118, 117, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--danger)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
              marginBottom: '1.5rem',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <Input
            label="Admin Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@techtrix.esports"
            required
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            icon={Lock}
          >
            Sign In with Email
          </Button>
        </form>

        <div style={{ margin: '1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Or
          </span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        </div>

        <Button
          type="button"
          variant="secondary"
          size="md"
          fullWidth
          loading={loading}
          onClick={handleGoogleAdminLogin}
        >
          Sign In with Google (Admin)
        </Button>

        <div
          style={{
            marginTop: '1.75rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.85rem',
          }}
        >
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: 'var(--text-secondary)',
            }}
          >
            <ArrowLeft size={14} />
            <span>Return to Site</span>
          </Link>

          <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
            Firebase Auth Secured
          </span>
        </div>

        {/* Security Note Helper */}
        <div
          style={{
            marginTop: '1.5rem',
            padding: '0.75rem 1rem',
            background: '#FAFBFF',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem',
          }}
        >
          <Info size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '1px' }} />
          <div>
            <strong>Administrator Access:</strong> Any user registered in Firebase Authentication can sign in with their credentials to access the admin dashboard.
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;

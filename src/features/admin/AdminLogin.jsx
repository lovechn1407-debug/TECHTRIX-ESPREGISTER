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

  const { adminLogin } = useAuth();
  const { showSuccess } = useToast();
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
            Sign In to Admin
          </Button>
        </form>

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
            Protected by /admins node
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
            <strong>Admin Access Policy:</strong> Administrator accounts must be registered in Firebase Authentication and authorized in the Realtime Database under <code>/admins/&#123;uid&#125;: true</code>.
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;

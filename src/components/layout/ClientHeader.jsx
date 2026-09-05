import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Trophy,
  LogIn,
  LogOut,
  ClipboardCheck,
  Menu,
  X,
  User,
  Shield,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../ui/Button';

export function ClientHeader() {
  const { user, isAdmin, loginWithGoogle, logout } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setAuthLoading(true);
      const loggedUser = await loginWithGoogle();
      showSuccess(`Signed in as ${loggedUser.displayName || 'Player'}`, 'Welcome');
    } catch (err) {
      showError(err.message || 'Failed to sign in with Google', 'Authentication Error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setDropdownOpen(false);
      showSuccess('Signed out successfully', 'Goodbye');
      navigate('/');
    } catch (err) {
      showError('Failed to sign out', 'Error');
    }
  };

  return (
    <header className="client-header">
      <div className="header-container">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo">
          <div className="brand-icon-box">
            <Trophy size={20} strokeWidth={2.5} />
          </div>
          <span className="gradient-text">TechTrix Esports</span>
        </Link>

        {/* Navigation */}
        <nav className={`client-nav ${mobileNavOpen ? 'mobile-open' : ''}`}>
          <NavLink
            to="/"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setMobileNavOpen(false)}
          >
            Home
          </NavLink>

          {user && (
            <NavLink
              to="/status"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setMobileNavOpen(false)}
            >
              <ClipboardCheck size={16} />
              <span>Check Status</span>
            </NavLink>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              className="nav-link"
              style={{ color: 'var(--primary)', fontWeight: 700 }}
              onClick={() => setMobileNavOpen(false)}
            >
              <Shield size={16} />
              <span>Admin Portal</span>
            </Link>
          )}

          {/* Mobile login/logout helper */}
          {mobileNavOpen && (
            <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              {user ? (
                <button
                  type="button"
                  className="btn btn-secondary btn-full"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary btn-full"
                  onClick={handleGoogleLogin}
                  disabled={authLoading}
                >
                  <LogIn size={16} />
                  <span>Login with Google</span>
                </button>
              )}
            </div>
          )}
        </nav>

        {/* Desktop Header Actions */}
        <div className="header-actions">
          {user ? (
            <div className="user-profile-menu" ref={dropdownRef}>
              <Link to="/status">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={ClipboardCheck}
                  className="status-header-btn"
                >
                  Check Status
                </Button>
              </Link>

              <img
                src={user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
                alt={user.displayName || 'User'}
                className="user-avatar"
                onClick={() => setDropdownOpen((prev) => !prev)}
                title={user.displayName || 'Profile menu'}
              />

              {dropdownOpen && (
                <div className="user-dropdown">
                  <div className="dropdown-user-info">
                    <div className="dropdown-user-name">{user.displayName || 'Player'}</div>
                    <div className="dropdown-user-email">{user.email}</div>
                  </div>

                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate('/status');
                    }}
                  >
                    <ClipboardCheck size={16} />
                    <span>My Registrations</span>
                  </button>

                  {isAdmin && (
                    <button
                      type="button"
                      className="dropdown-item"
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate('/admin');
                      }}
                    >
                      <Shield size={16} color="var(--primary)" />
                      <span>Admin Dashboard</span>
                    </button>
                  )}

                  <button
                    type="button"
                    className="dropdown-item danger-item"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Button
              variant="primary"
              size="sm"
              icon={LogIn}
              onClick={handleGoogleLogin}
              loading={authLoading}
            >
              Login with Google
            </Button>
          )}

          {/* Mobile hamburger */}
          <button
            type="button"
            className="mobile-nav-toggle"
            onClick={() => setMobileNavOpen((prev) => !prev)}
            aria-label="Toggle navigation"
          >
            {mobileNavOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </header>
  );
}

export default ClientHeader;

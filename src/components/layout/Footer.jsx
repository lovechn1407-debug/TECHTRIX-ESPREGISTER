import React from 'react';
import { Trophy, Shield, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer
      style={{
        background: '#FFFFFF',
        borderTop: '1px solid var(--border)',
        padding: '3rem 1.5rem 2rem 1.5rem',
        marginTop: 'auto',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
            paddingBottom: '2rem',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div className="brand-icon-box" style={{ width: '32px', height: '32px' }}>
              <Trophy size={16} strokeWidth={2.5} />
            </div>
            <div>
              <div className="gradient-text" style={{ fontWeight: 800, fontSize: '1.2rem' }}>
                TechTrix Esports
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Premier tournament registration & verified player matchmaking
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.88rem' }}>
            <Link to="/" style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
              Tournaments
            </Link>
            <Link to="/status" style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
              Check Status
            </Link>
            <Link to="/admin/login" style={{ color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Shield size={14} />
              <span>Admin</span>
            </Link>
          </div>
        </div>

        <div
          style={{
            paddingTop: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
          }}
        >
          <div>
            &copy; {new Date().getFullYear()} TechTrix Esports. All rights reserved.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            Powered by TechTrix Platform
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

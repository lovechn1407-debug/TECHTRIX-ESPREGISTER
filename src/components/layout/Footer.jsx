import React from 'react';
import { Shield, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import ecellLogo from '../../assets/ecell-logo.png';
import techtrixLogo from '../../assets/techtrix-logo.png';

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <img
              src={ecellLogo}
              alt="E-Cell I.T.S Engineering College"
              style={{ height: '34px', width: 'auto', objectFit: 'contain' }}
            />
            <div style={{ width: '1px', height: '22px', background: 'var(--border)' }} />
            <img
              src={techtrixLogo}
              alt="TechTrix Esports"
              style={{ height: '26px', width: 'auto', objectFit: 'contain' }}
            />
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

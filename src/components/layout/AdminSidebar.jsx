import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  LogOut,
  Trophy,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useForms } from '../../hooks/useFirebase';

export function AdminSidebar() {
  const { logout } = useAuth();
  const { forms } = useForms();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <Link to="/admin" className="brand-logo" style={{ fontSize: '1.25rem' }}>
            <div className="brand-icon-box" style={{ width: '32px', height: '32px' }}>
              <Trophy size={16} strokeWidth={2.5} />
            </div>
            <span className="gradient-text">TechTrix Admin</span>
          </Link>
        </div>

        <nav className="admin-nav">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <div className="admin-nav-item-left">
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </div>
          </NavLink>

          <NavLink
            to="/admin/create"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <div className="admin-nav-item-left">
              <PlusCircle size={18} />
              <span>Create Registration</span>
            </div>
          </NavLink>

          <NavLink
            to="/admin/forms"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <div className="admin-nav-item-left">
              <FileText size={18} />
              <span>Forms</span>
            </div>
            {forms && forms.length > 0 && (
              <span className="admin-nav-count">{forms.length}</span>
            )}
          </NavLink>

          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="admin-nav-item"
            style={{ marginTop: 'auto' }}
          >
            <div className="admin-nav-item-left">
              <ExternalLink size={18} />
              <span>Live Website</span>
            </div>
          </a>
        </nav>

        <div className="admin-sidebar-footer">
          <button
            type="button"
            className="admin-nav-item"
            onClick={handleLogout}
            style={{ color: 'var(--danger)' }}
          >
            <div className="admin-nav-item-left">
              <LogOut size={18} />
              <span>Sign Out</span>
            </div>
          </button>
        </div>
      </aside>

      {/* Mobile Header Bar */}
      <div className="admin-mobile-header">
        <div className="brand-logo" style={{ fontSize: '1.15rem' }}>
          <div className="brand-icon-box" style={{ width: '28px', height: '28px' }}>
            <Trophy size={14} strokeWidth={2.5} />
          </div>
          <span className="gradient-text">TechTrix Admin</span>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="btn btn-ghost btn-sm"
          style={{ color: 'var(--danger)' }}
        >
          <LogOut size={16} />
        </button>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="admin-mobile-bottom-nav">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) => `admin-mobile-nav-btn ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/admin/create"
          className={({ isActive }) => `admin-mobile-nav-btn ${isActive ? 'active' : ''}`}
        >
          <PlusCircle size={20} />
          <span>Create</span>
        </NavLink>

        <NavLink
          to="/admin/forms"
          className={({ isActive }) => `admin-mobile-nav-btn ${isActive ? 'active' : ''}`}
        >
          <FileText size={20} />
          <span>Forms</span>
        </NavLink>

        <a href="/" className="admin-mobile-nav-btn">
          <ExternalLink size={20} />
          <span>Website</span>
        </a>
      </nav>
    </>
  );
}

export default AdminSidebar;

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Search,
  Plus,
  Trash2,
  ExternalLink,
  Users,
  Calendar,
  AlertTriangle,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { useForms, toggleFormStatus, deleteTournamentForm } from '../../hooks/useFirebase';
import { formatDate } from '../../utils/helpers';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Loading from '../../components/common/Loading';

export function FormsList() {
  const navigate = useNavigate();
  const { forms, loading } = useForms();
  const { showSuccess, showError } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [formToDelete, setFormToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Search filter
  const filteredForms = useMemo(() => {
    if (!searchQuery.trim()) return forms;
    const q = searchQuery.toLowerCase();
    return forms.filter(
      (f) =>
        f.formName?.toLowerCase().includes(q) ||
        f.shortName?.toLowerCase().includes(q) ||
        f.gameTitle?.toLowerCase().includes(q)
    );
  }, [forms, searchQuery]);

  const handleToggleStatus = async (e, form) => {
    e.stopPropagation();
    try {
      const nextStatus = await toggleFormStatus(form.id, form.status);
      showSuccess(`Tournament status set to ${nextStatus}`, 'Status Updated');
    } catch (err) {
      showError('Failed to update tournament status', 'Error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!formToDelete) return;
    setDeleting(true);
    try {
      await deleteTournamentForm(formToDelete.id);
      showSuccess(`Deleted tournament "${formToDelete.formName}"`, 'Tournament Deleted');
      setFormToDelete(null);
    } catch (err) {
      showError('Failed to delete tournament', 'Error');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <Loading message="Loading tournament forms..." fullPage />;
  }

  return (
    <div className="admin-forms-page">
      <div className="table-filter-bar">
        <div>
          <h1 style={{ fontSize: '1.85rem' }}>Tournament Forms</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Manage registration settings, open/close registrations, and monitor submissions.
          </p>
        </div>

        <Button variant="primary" icon={Plus} onClick={() => navigate('/admin/create')}>
          Create Form
        </Button>
      </div>

      <div className="table-filter-bar" style={{ marginTop: '1rem' }}>
        <div className="table-search-box">
          <Search className="table-search-icon" size={18} />
          <input
            type="text"
            className="input-field"
            placeholder="Search tournaments by name or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Showing <strong>{filteredForms.length}</strong> of <strong>{forms.length}</strong> tournaments
        </div>
      </div>

      {/* Forms Table */}
      <div className="custom-table-card">
        {filteredForms.length === 0 ? (
          <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
            <FileText size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem auto' }} />
            <h4>No Tournament Forms Found</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              {searchQuery ? 'No tournaments match your search criteria.' : 'Create your first tournament to start accepting player registrations.'}
            </p>
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Form Details</th>
                <th>Game / Mode</th>
                <th>Format</th>
                <th>Status (Toggle)</th>
                <th>Submissions</th>
                <th>Created Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredForms.map((form) => {
                const isOpen = form.status === 'open';
                const subCount = Number(form.submissionCount || 0);

                return (
                  <tr
                    key={form.id}
                    className="clickable-row"
                    onClick={() => navigate(`/admin/forms/${form.id}`)}
                  >
                    <td>
                      <div style={{ fontWeight: 700, fontSize: '0.98rem' }}>{form.formName}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                        <span className="tag-mono" style={{ fontSize: '0.72rem' }}>
                          {form.shortName || 'ID'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          ID: {form.id?.substring(0, 8)}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                        <Flame size={14} color="var(--primary)" />
                        <span>{form.gameTitle || form.gameName}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {form.gameMode}
                      </div>
                    </td>

                    <td style={{ textTransform: 'capitalize' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          background: 'rgba(108, 92, 231, 0.08)',
                          color: 'var(--primary)',
                          padding: '0.2rem 0.55rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                        }}
                      >
                        {form.teamType}
                      </span>
                    </td>

                    <td onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={isOpen}
                            onChange={(e) => handleToggleStatus(e, form)}
                          />
                          <span className="toggle-slider" />
                        </label>
                        <span
                          style={{
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            color: isOpen ? 'var(--success)' : 'var(--danger)',
                          }}
                        >
                          {isOpen ? 'Open' : 'Closed'}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{subCount}</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginLeft: '0.25rem' }}>
                        {form.maxRegistrations && form.maxRegistrations !== 'unlimited'
                          ? `/ ${form.maxRegistrations}`
                          : 'entries'}
                      </span>
                    </td>

                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {formatDate(form.createdAt)}
                    </td>

                    <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="View Live Registration Form"
                          onClick={() => window.open(`/register/${form.id}`, '_blank')}
                        >
                          <ExternalLink size={16} />
                        </Button>

                        <Button
                          variant="danger"
                          size="sm"
                          title="Delete Tournament"
                          onClick={() => setFormToDelete(form)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {formToDelete && (
        <Modal
          isOpen={Boolean(formToDelete)}
          onClose={() => setFormToDelete(null)}
          title="Confirm Tournament Deletion"
          footer={
            <>
              <Button variant="secondary" onClick={() => setFormToDelete(null)}>
                Cancel
              </Button>
              <Button
                variant="danger-solid"
                loading={deleting}
                onClick={handleDeleteConfirm}
              >
                Delete Tournament
              </Button>
            </>
          }
        >
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'rgba(255, 118, 117, 0.15)',
                color: 'var(--danger)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <AlertTriangle size={24} />
            </div>
            <div>
              <h4 style={{ marginBottom: '0.35rem' }}>Are you sure you want to delete this tournament?</h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                You are about to permanently delete <strong>{formToDelete.formName}</strong> and all associated player submissions. This action cannot be undone.
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default FormsList;

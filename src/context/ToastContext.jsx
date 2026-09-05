import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', title = '') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    const newToast = { id, message, type, title };

    setToasts((prev) => [...prev, newToast]);

    // Auto-dismiss
    setTimeout(() => {
      removeToast(id);
    }, 4500);

    return id;
  }, [removeToast]);

  const showSuccess = useCallback((message, title = 'Success') => {
    return showToast(message, 'success', title);
  }, [showToast]);

  const showError = useCallback((message, title = 'Error') => {
    return showToast(message, 'error', title);
  }, [showToast]);

  const showInfo = useCallback((message, title = 'Notice') => {
    return showToast(message, 'info', title);
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showInfo, removeToast }}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map((toast) => {
          let Icon = Info;
          if (toast.type === 'success') Icon = CheckCircle2;
          if (toast.type === 'error') Icon = AlertCircle;

          return (
            <div key={toast.id} className={`toast toast-${toast.type}`}>
              <Icon className="toast-icon" size={20} />
              <div className="toast-content">
                {toast.title && <div className="toast-title">{toast.title}</div>}
                <div className="toast-message">{toast.message}</div>
              </div>
              <button
                type="button"
                className="toast-close"
                onClick={() => removeToast(toast.id)}
                aria-label="Close notification"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

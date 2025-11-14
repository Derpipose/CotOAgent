import React from 'react';
import { useToast } from '../context/ToastContext';
import '../css/toast.css';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type} ${toast.isPersistent ? 'toast-persistent' : ''}`}
          role="alert"
          aria-live={toast.isPersistent ? 'assertive' : 'polite'}
        >
          <div className="toast-content">
            <span className="toast-message">{toast.message}</span>
            <button
              className="toast-close"
              onClick={() => removeToast(toast.id)}
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
          {!toast.isPersistent && <div className="toast-progress" />}
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;

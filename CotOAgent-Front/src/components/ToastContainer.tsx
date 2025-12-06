import React from 'react';
import { useToast } from '../context/ToastContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  // Helper to get toast type styles
  const getToastStyles = (type: string, isPersistent: boolean | undefined) => {
    const baseClasses = 'toast-item';
    
    const typeStyles = {
      success: 'toast-item-success',
      error: 'toast-item-error',
      warning: 'toast-item-warning',
      info: 'toast-item-info',
    };

    const persistentStyles = isPersistent ? 'toast-item-persistent' : '';
    
    const borderColorStyles = isPersistent ? {
      success: 'toast-item-persistent-success',
      error: 'toast-item-persistent-error',
      warning: 'toast-item-persistent-warning',
      info: 'toast-item-persistent-info',
    }[type] || '' : '';

    return `${baseClasses} ${typeStyles[type as keyof typeof typeStyles] || ''} ${persistentStyles} ${borderColorStyles}`;
  };

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={getToastStyles(toast.type, toast.isPersistent)}
          role="alert"
          aria-live={toast.isPersistent ? 'assertive' : 'polite'}
        >
          <div className="toast-item-content">
            <span className="toast-item-message">{toast.message}</span>
            <button
              className={`toast-item-close-button ${
                toast.isPersistent ? 'toast-item-close-button-persistent' : 'toast-item-close-button-temporary'
              }`}
              onClick={() => removeToast(toast.id)}
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
          {!toast.isPersistent && <div className="toast-item-progress" />}
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;

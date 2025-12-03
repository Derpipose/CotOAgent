import React from 'react';
import { useToast } from '../context/ToastContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  // Helper to get toast type styles
  const getToastStyles = (type: string, isPersistent: boolean | undefined) => {
    const baseClasses = 'flex flex-col min-w-80 max-w-2xl rounded-lg shadow-md overflow-hidden animate-slideIn pointer-events-auto';
    
    const typeStyles = {
      success: 'bg-emerald-500 text-white',
      error: 'bg-red-500 text-white',
      warning: 'bg-amber-600 text-white',
      info: 'bg-blue-500 text-white',
    };

    const persistentStyles = isPersistent ? 'border-l-4 shadow-lg' : '';
    
    const borderColorStyles = isPersistent ? {
      success: 'border-l-emerald-500',
      error: 'border-l-red-500',
      warning: 'border-l-amber-600',
      info: 'border-l-blue-500',
    }[type] || '' : '';

    return `${baseClasses} ${typeStyles[type as keyof typeof typeStyles] || ''} ${persistentStyles} ${borderColorStyles}`;
  };

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={getToastStyles(toast.type, toast.isPersistent)}
          role="alert"
          aria-live={toast.isPersistent ? 'assertive' : 'polite'}
        >
          <div className="flex justify-between items-center gap-3 px-5 py-4">
            <span className="flex-1 text-sm font-medium break-words">{toast.message}</span>
            <button
              className={`flex-shrink-0 bg-none border-none text-2xl cursor-pointer p-0 w-6 h-6 flex items-center justify-center transition-all duration-200 ${
                toast.isPersistent ? 'opacity-100 font-bold hover:scale-125' : 'opacity-70 hover:opacity-100'
              }`}
              onClick={() => removeToast(toast.id)}
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
          {!toast.isPersistent && <div className="h-1 bg-white/30 animate-progress" />}
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;

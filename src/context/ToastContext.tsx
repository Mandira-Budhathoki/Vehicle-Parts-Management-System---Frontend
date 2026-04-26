import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

type ToastVariant = 'success' | 'danger' | 'warning' | 'info';

interface ToastMessage {
  id: number;
  title: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextType {
  showToast: (message: string, variant?: ToastVariant, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let toastId = 0;

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, variant: ToastVariant = 'info', title?: string) => {
    const id = ++toastId;
    const defaultTitles: Record<ToastVariant, string> = {
      success: 'Success',
      danger: 'Error',
      warning: 'Warning',
      info: 'Info',
    };
    setToasts(prev => [...prev, { id, message, variant, title: title || defaultTitles[variant] }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const iconMap: Record<ToastVariant, string> = {
    success: 'bi-check-circle-fill',
    danger: 'bi-exclamation-triangle-fill',
    warning: 'bi-exclamation-circle-fill',
    info: 'bi-info-circle-fill',
  };

  const colorMap: Record<ToastVariant, string> = {
    success: '#22c55e',
    danger: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer
        position="top-end"
        className="p-3"
        style={{ zIndex: 9999, position: 'fixed' }}
      >
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            onClose={() => removeToast(toast.id)}
            autohide
            delay={4000}
            className="border-0 shadow-lg"
            style={{
              backgroundColor: 'rgba(30, 30, 40, 0.95)',
              backdropFilter: 'blur(12px)',
              borderLeft: `4px solid ${colorMap[toast.variant]}`,
              minWidth: '320px',
            }}
          >
            <Toast.Header
              closeVariant="white"
              style={{
                backgroundColor: 'transparent',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
              }}
            >
              <i className={`bi ${iconMap[toast.variant]} me-2`} style={{ color: colorMap[toast.variant] }}></i>
              <strong className="me-auto">{toast.title}</strong>
              <small className="text-secondary">Just now</small>
            </Toast.Header>
            <Toast.Body style={{ color: '#e2e8f0' }}>
              {toast.message}
            </Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

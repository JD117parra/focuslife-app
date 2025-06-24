'use client';

import { useState, useCallback } from 'react';
import Toast from '@/components/Toast';

interface ToastData {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning' | 'delete' | 'welcome';
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback(
    (
      message: string,
      type: 'success' | 'error' | 'info' | 'warning' | 'delete' | 'welcome' = 'info',
      duration?: number
    ) => {
      const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
      const newToast: ToastData = { id, message, type, duration };

      setToasts(prev => [...prev, newToast]);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Convenience methods
  const success = useCallback(
    (message: string, duration?: number) => {
      showToast(message, 'success', duration);
    },
    [showToast]
  );

  const error = useCallback(
    (message: string, duration?: number) => {
      showToast(message, 'error', duration);
    },
    [showToast]
  );

  const warning = useCallback(
    (message: string, duration?: number) => {
      showToast(message, 'warning', duration);
    },
    [showToast]
  );

  const info = useCallback(
    (message: string, duration?: number) => {
      showToast(message, 'info', duration);
    },
    [showToast]
  );

  const deleteToast = useCallback(
    (message: string, duration?: number) => {
      showToast(message, 'delete', duration);
    },
    [showToast]
  );

  const welcome = useCallback(
    (message: string, duration?: number) => {
      showToast(message, 'welcome', duration);
    },
    [showToast]
  );

  const ToastContainer = useCallback(
    () => (
      <div className="fixed inset-0 pointer-events-none z-[10000]">
        <div className="absolute bottom-4 right-4 space-y-2">
          {toasts.map(toast => (
            <div key={toast.id} className="pointer-events-auto">
              <Toast
                message={toast.message}
                type={toast.type}
                duration={toast.duration}
                onClose={() => removeToast(toast.id)}
              />
            </div>
          ))}
        </div>
      </div>
    ),
    [toasts, removeToast]
  );

  return {
    showToast,
    success,
    error,
    warning,
    info,
    delete: deleteToast,
    welcome,
    ToastContainer,
  };
}

'use client';

import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning' | 'delete';
  duration?: number;
  onClose: () => void;
}

export default function Toast({
  message,
  type,
  duration = 3000,
  onClose,
}: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // Wait for animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getToastStyles = () => {
    const baseStyles =
      'fixed top-4 right-4 p-4 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out z-50 max-w-sm';

    if (!visible) {
      return `${baseStyles} translate-x-full opacity-0`;
    }

    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-500 text-white translate-x-0 opacity-100`;
      case 'error':
        return `${baseStyles} bg-red-500 text-white translate-x-0 opacity-100`;
      case 'warning':
        return `${baseStyles} bg-yellow-500 text-white translate-x-0 opacity-100`;
      case 'info':
        return `${baseStyles} bg-blue-500 text-white translate-x-0 opacity-100`;
      case 'delete':
        return `${baseStyles} bg-orange-500 text-white translate-x-0 opacity-100`;
      default:
        return `${baseStyles} bg-gray-500 text-white translate-x-0 opacity-100`;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'delete':
        return '🗑️';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  return (
    <div className={getToastStyles()}>
      <div className="flex items-center space-x-3">
        <span className="text-lg">{getIcon()}</span>
        <p className="font-medium">{message}</p>
        <button
          onClick={() => {
            setVisible(false);
            setTimeout(onClose, 300);
          }}
          className="ml-auto text-white hover:text-gray-200 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

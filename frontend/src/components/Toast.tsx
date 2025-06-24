'use client';

import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning' | 'delete' | 'welcome';
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
    // Pequeño delay para la animación de entrada
    const showTimer = setTimeout(() => {
      setVisible(true);
    }, 10);

    // Timer para ocultar el toast
    const hideTimer = setTimeout(() => {
      setVisible(false);
      // Tiempo adicional para la animación de salida
      setTimeout(onClose, 300);
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [duration, onClose]);

  const getToastStyles = () => {
    const baseStyles = `
      p-4 rounded-lg shadow-2xl transform transition-all duration-300 ease-in-out 
      max-w-sm w-full border-2 backdrop-blur-md
    `;

    const visibilityStyles = visible 
      ? 'translate-x-0 opacity-100 scale-100' 
      : 'translate-x-full opacity-0 scale-95';

    switch (type) {
      case 'success':
        return `${baseStyles} ${visibilityStyles} bg-green-500/90 text-white border-green-400`;
      case 'error':
        return `${baseStyles} ${visibilityStyles} bg-red-500/90 text-white border-red-400`;
      case 'warning':
        return `${baseStyles} ${visibilityStyles} bg-yellow-500/90 text-white border-yellow-400`;
      case 'info':
        return `${baseStyles} ${visibilityStyles} bg-blue-500/90 text-white border-blue-400`;
      case 'delete':
        return `${baseStyles} ${visibilityStyles} bg-orange-500/90 text-white border-orange-400`;
      case 'welcome':
        return `${baseStyles} ${visibilityStyles} bg-purple-500/90 text-white border-purple-400 ring-4 ring-purple-300/50`;
      default:
        return `${baseStyles} ${visibilityStyles} bg-gray-500/90 text-white border-gray-400`;
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
      case 'welcome':
        return '';
      default:
        return '📢';
    }
  };

  const icon = getIcon();

  return (
    <div className={getToastStyles()}>
      <div className={`flex items-start ${icon ? 'space-x-3' : 'space-x-0'}`}>
        {icon && <span className="text-xl flex-shrink-0 mt-0.5">{icon}</span>}
        <p className={`leading-relaxed flex-1 ${
          type === 'welcome' ? 'font-bold text-base' : 'font-medium text-sm'
        }`}>{message}</p>
        <button
          onClick={() => {
            setVisible(false);
            setTimeout(onClose, 300);
          }}
          className={`text-white/80 hover:text-white transition-colors text-lg flex-shrink-0 hover:bg-white/20 rounded-full w-6 h-6 flex items-center justify-center ${
            icon ? 'ml-2' : 'ml-3'
          }`}
          aria-label="Cerrar notificación"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

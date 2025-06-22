'use client';

import { useEffect, useRef } from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  icon?: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonColor?: 'red' | 'blue' | 'green' | 'yellow';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title = 'Confirmar acción',
  message,
  icon = '⚠️',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmButtonColor = 'red',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Manejar tecla ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // Focus en el botón de confirmar cuando se abre
      setTimeout(() => {
        confirmButtonRef.current?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onCancel]);

  // Prevenir scroll del body cuando está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getConfirmButtonStyles = () => {
    const baseStyles =
      'px-5 py-2.5 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 backdrop-blur-sm border shadow-sm';

    switch (confirmButtonColor) {
      case 'red':
        return `${baseStyles} bg-red-600/90 text-white hover:bg-red-700/90 focus:ring-red-500 border-red-500/30`;
      case 'blue':
        return `${baseStyles} bg-blue-600/90 text-white hover:bg-blue-700/90 focus:ring-blue-500 border-blue-500/30`;
      case 'green':
        return `${baseStyles} bg-green-600/90 text-white hover:bg-green-700/90 focus:ring-green-500 border-green-500/30`;
      case 'yellow':
        return `${baseStyles} bg-yellow-600/90 text-white hover:bg-yellow-700/90 focus:ring-yellow-500 border-yellow-500/30`;
      default:
        return `${baseStyles} bg-red-600/90 text-white hover:bg-red-700/90 focus:ring-red-500 border-red-500/30`;
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden">
      {/* Backdrop con blur glassmorphism */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Contenedor centrado para el modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        {/* Modal con glassmorphism */}
        <div
          ref={modalRef}
          className="relative bg-white/25 backdrop-blur-md shadow-lg border border-white/45 rounded-lg max-w-md w-full p-6 transform transition-all duration-300 ease-out scale-100 opacity-100"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0 w-12 h-12 bg-white/30 backdrop-blur-md border border-white/45 rounded-full flex items-center justify-center text-xl mr-4 shadow-lg">
              {icon}
            </div>
            <h3
              className="text-lg font-bold text-white"
              style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}
            >
              {title}
            </h3>
          </div>

          {/* Message */}
          <div className="mb-6">
            <p
              className="text-white/90 text-sm leading-relaxed font-medium"
              style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}
            >
              {message}
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-white/30">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 bg-white/20 backdrop-blur-md text-white rounded-lg font-bold border border-white/30 hover:bg-white/30 transition-all duration-150 shadow-lg"
              style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' }}
            >
              {cancelText}
            </button>
            <button
              ref={confirmButtonRef}
              type="button"
              onClick={onConfirm}
              className={getConfirmButtonStyles()}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
